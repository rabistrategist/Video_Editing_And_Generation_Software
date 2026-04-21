import { NextRequest, NextResponse } from "next/server";
import { spawn, exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import { mkdir } from "fs/promises";

const execAsync = promisify(exec);

async function hasAudioStream(filePath: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "${filePath}"`);
    return stdout.trim().length > 0;
  } catch (error) {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { layers, tracks, canvas, duration, settings } = data;

    if (!layers || !canvas) {
      return NextResponse.json({ error: "Invalid project state" }, { status: 400 });
    }

    // Resolve Export Settings
    const resolutionMap: Record<string, { w: number, h: number }> = {
      "480p": { w: 854, h: 480 },
      "720p": { w: 1280, h: 720 },
      "1080p": { w: 1920, h: 1080 },
      "4K": { w: 3840, h: 2160 },
    };
    
    const baseRes = resolutionMap[settings?.resolution || "1080p"] || resolutionMap["1080p"];
    
    // Scale canvas to match the requested resolution "quality" while preserving aspect ratio exactly.
    // In landscape, we fix the height to baseRes.h. In portrait/square, we fix the width to baseRes.h. (i.e. '1080' width minimum)
    const scale = canvas.height >= canvas.width 
      ? baseRes.h / canvas.width 
      : baseRes.h / canvas.height;
      
    const targetRes = {
      w: Math.round((canvas.width * scale) / 2) * 2,
      h: Math.round((canvas.height * scale) / 2) * 2
    };
    const targetFps = parseInt(settings?.fps || "30");
    const qualityMap: Record<string, number> = {
      "Ultra": 18,
      "High": 23,
      "Medium": 28,
      "Low": 33,
    };
    const targetCrf = qualityMap[settings?.quality || "High"] || 23;
    const isWebM = settings?.format === "WebM";

    const renderDir = path.join(process.cwd(), "temp", "renders");
    if (!fs.existsSync(renderDir)) {
      await mkdir(renderDir, { recursive: true });
    }

    const ext = isWebM ? "webm" : "mp4";
    const outputFilename = `export-${Date.now()}.${ext}`;
    const outputPath = path.join(renderDir, outputFilename);

    const args: string[] = [];

    // 1. Inputs handling
    // Input 0: Background color source
    args.push("-f", "lavfi", "-i", `color=c=${canvas.backgroundColor.replace('#', '0x')}:s=${targetRes.w}x${targetRes.h}:d=${duration}:r=${targetFps}`);

    const mediaLayers = layers.filter((l: any) => l.serverPath && l.isVisible);
    
    // Check which media layers have audio
    for (const layer of mediaLayers) {
      if (layer.type === 'video') {
        layer.hasAudio = await hasAudioStream(layer.serverPath);
      } else if (layer.type === 'audio') {
        layer.hasAudio = true;
      }
    }

    mediaLayers.forEach((layer: any) => {
      // Basic trim start at input level for efficiency if needed, but we'll do it in filters for precision
      args.push("-i", layer.serverPath);
    });

    // 2. Filter Complex Building
    let vFilters: string[] = [];
    let aFilters: string[] = [];
    let aOutLabels: string[] = [];
    
    let currentVLabel = "0:v";
    let inputIdx = 1;

    // Process Visual Layers (Media)
    mediaLayers.forEach((layer: any) => {
      if (layer.type === 'video' || layer.type === 'image') {
        const inLabel = `${inputIdx}:v`;
        const processedLabel = `v${inputIdx}_proc`;
        const overlayLabel = `ovl${inputIdx}`;

        // Timing, Scaling, Speed, Opacity, Transitions and Adjustments (Color Filters)
        const speed = layer.transform?.speed || 1;
        const opacity = layer.transform?.opacity ?? 1;

        const adj = layer.adjustments || {};
        const brightness = adj.brightness || 0; // -1 to 1
        const contrast = 1 + (adj.contrast || 0) / 100; // 0 to 2
        const saturation = 1 + (adj.saturation || 0); // 0 to 2
        const shadow = (adj.shadow || 0) / 100; // -1 to 1
        const highlight = (adj.highlight || 0) / 100; // -1 to 1

        let vChain = `trim=start=${layer.trimStart}:duration=${layer.duration * speed},setpts=(1/${speed})*(PTS-STARTPTS)+${layer.startAt}/TB,scale=${Math.round(layer.transform.width * (targetRes.w / canvas.width))}:${Math.round(layer.transform.height * (targetRes.h / canvas.height))}`;
        
        // eq filter for brightness, contrast, saturation
        vChain += `,eq=brightness=${brightness}:contrast=${contrast}:saturation=${saturation}`;
        
        if (shadow !== 0 || highlight !== 0) {
           vChain += `,colorbalance=rs=${shadow}:gs=${shadow}:bs=${shadow}:rh=${highlight}:gh=${highlight}:bh=${highlight}`;
        }

        // Ensure alpha channel exists for opacity/fade
        vChain += `,format=yuva420p`;

        if (opacity < 1) {
          vChain += `,colorchannelmixer=aa=${opacity}`;
        }

        const inDur = layer.transitions?.in?.duration || 1;
        const outDur = layer.transitions?.out?.duration || 1;

        if (layer.transitions?.in?.type === 'fade' || layer.transitions?.in?.type === 'zoomIn') {
          vChain += `,fade=t=in:st=0:d=${inDur}:alpha=1`;
        }
        if (layer.transitions?.out?.type === 'fade' || layer.transitions?.out?.type === 'zoomOut') {
          vChain += `,fade=t=out:st=${Math.max(0, layer.duration - outDur)}:d=${outDur}:alpha=1`;
        }

        vFilters.push(`[${inLabel}]${vChain}[${processedLabel}]`);
        
        // Overlay
        const x = Math.round(layer.transform.x * (targetRes.w / canvas.width));
        const y = Math.round(layer.transform.y * (targetRes.h / canvas.height));
        const w = Math.round(layer.transform.width * (targetRes.w / canvas.width));
        
        let xExpr = `${x}`;
        let yExpr = `${y}`;

        if (layer.transitions?.in?.type === 'slideRight') {
            xExpr = `if(lt(t,${layer.startAt + inDur}), ${-w} + (${x} - ${-w}) * (t - ${layer.startAt}) / ${inDur}, ${xExpr})`;
        } else if (layer.transitions?.in?.type === 'slideLeft') {
            xExpr = `if(lt(t,${layer.startAt + inDur}), ${targetRes.w} + (${x} - ${targetRes.w}) * (t - ${layer.startAt}) / ${inDur}, ${xExpr})`;
        }
        
        if (layer.transitions?.out?.type === 'slideRight') {
             const outStartT = layer.startAt + layer.duration - outDur;
             xExpr = `if(gt(t,${outStartT}), ${x} + (${targetRes.w} - ${x}) * (t - ${outStartT}) / ${outDur}, ${xExpr})`;
        } else if (layer.transitions?.out?.type === 'slideLeft') {
             const outStartT = layer.startAt + layer.duration - outDur;
             xExpr = `if(gt(t,${outStartT}), ${x} + (${-w} - ${x}) * (t - ${outStartT}) / ${outDur}, ${xExpr})`;
        }

        vFilters.push(`[${currentVLabel}][${processedLabel}]overlay=x='${xExpr}':y='${yExpr}':enable='between(t,${layer.startAt},${layer.startAt + layer.duration})'[${overlayLabel}]`);
        
        currentVLabel = overlayLabel;
      }
      
      // Audio Handling for Media
      if ((layer.type === 'video' || layer.type === 'audio') && layer.hasAudio) {
        const inALabel = `${inputIdx}:a`;
        const aOutLabel = `a${inputIdx}_proc`;
        aOutLabels.push(`[${aOutLabel}]`);
        
        const speed = layer.transform?.speed || 1;
        let atempo = '';
        let currentSpeed = speed;
        while (currentSpeed < 0.5) {
          atempo += `,atempo=0.5`;
          currentSpeed /= 0.5;
        }
        if (currentSpeed !== 1 && currentSpeed > 0) {
          atempo += `,atempo=${currentSpeed}`;
        }

        const trackVolume = tracks?.find((t: any) => t.id === layer.track)?.volume ?? 1;
        
        let aChain = `atrim=start=${layer.trimStart}:duration=${layer.duration * speed},asetpts=PTS-STARTPTS${atempo},volume=${trackVolume}`;
        
        if (layer.transitions?.in?.type === 'fade') {
          aChain += `,afade=t=in:st=0:d=${layer.transitions.in.duration}`;
        }
        if (layer.transitions?.out?.type === 'fade') {
          aChain += `,afade=t=out:st=${Math.max(0, layer.duration - layer.transitions.out.duration)}:d=${layer.transitions.out.duration}`;
        }

        const delayMs = Math.round(layer.startAt * 1000);
        aChain += `,adelay=${delayMs}|${delayMs}`;

        aFilters.push(`[${inALabel}]${aChain}[${aOutLabel}]`);
      }
      
      inputIdx++;
    });

    // Shapes
    const shapeLayers = layers.filter((l: any) => l.type === 'shape' && l.isVisible);
    shapeLayers.forEach((layer: any, i: number) => {
      const shapeLabel = `sh${i}`;
      const color = layer.color?.replace('#', '0x') || '0xffffff';
      const x = Math.round(layer.transform.x * (targetRes.w / canvas.width));
      const y = Math.round(layer.transform.y * (targetRes.h / canvas.height));
      const w = Math.round(layer.transform.width * (targetRes.w / canvas.width));
      const h = Math.round(layer.transform.height * (targetRes.h / canvas.height));
      
      vFilters.push(`[${currentVLabel}]drawbox=x=${x}:y=${y}:w=${w}:h=${h}:color=${color}:t=fill:enable='between(t,${layer.startAt},${layer.startAt + layer.duration})'[${shapeLabel}]`);
      currentVLabel = shapeLabel;
    });

    // Text Layers
    const textLayers = layers.filter((l: any) => l.type === 'text' && l.isVisible);
    textLayers.forEach((layer: any, i: number) => {
      const textLabel = `txt${i}`;
      const escapedText = layer.content.replace(/'/g, "'\\\\\\''").replace(/:/g, "\\:");
      const color = layer.color || 'white';
      const x = Math.round(layer.transform.x * (targetRes.w / canvas.width));
      const y = Math.round(layer.transform.y * (targetRes.h / canvas.height));
      const fontSize = Math.round((layer.fontSize || 32) * (targetRes.h / canvas.height));
      
      vFilters.push(`[${currentVLabel}]drawtext=text='${escapedText}':fontcolor='${color}':fontsize=${fontSize}:x=${x}:y=${y}:enable='between(t,${layer.startAt},${layer.startAt + layer.duration})'[${textLabel}]`);
      currentVLabel = textLabel;
    });

    // Final Audio Mix
    let finalALabel = "";
    if (aFilters.length > 0) {
      if (aFilters.length === 1) {
        // If there's only one audio stream, we don't need amix, just map it directly.
        vFilters.push(...aFilters);
        // Extract the label without brackets to assign to finalALabel
        finalALabel = aOutLabels[0].replace(/[\\[\\]]/g, '');
      } else {
        const aLabels = aOutLabels.join("");
        vFilters.push(...aFilters);
        vFilters.push(`${aLabels}amix=inputs=${aOutLabels.length}:duration=longest[outa]`);
        finalALabel = "outa";
      }
    }

    const filterComplex = vFilters.join(";");
    
    args.push("-filter_complex", filterComplex);
    args.push("-map", `[${currentVLabel}]`);
    if (finalALabel) {
      args.push("-map", `[${finalALabel}]`);
    }

    // Encoding Settings
    if (isWebM) {
      args.push("-c:v", "libvpx-vp9", "-crf", targetCrf.toString(), "-b:v", "0", "-c:a", "libopus");
    } else {
      args.push("-c:v", "libx264", "-crf", targetCrf.toString(), "-preset", "ultrafast", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k");
    }
    
    args.push("-r", targetFps.toString(), "-y", outputPath);

    console.log("Advanced FFmpeg Command:", "ffmpeg " + args.join(" "));

    return new Promise<NextResponse>((resolve) => {
      const ffmpeg = spawn("ffmpeg", args);
      let errorLog = "";

      ffmpeg.stderr.on("data", (data) => {
        errorLog += data.toString();
        // console.log(`FFmpeg: ${data}`); // Disabled for production speed but useful for debug
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve(NextResponse.json({ success: true, url: `/api/export/download?file=${outputFilename}` }));
        } else {
          console.error("FFmpeg Error Log:", errorLog);
          resolve(NextResponse.json({ error: "FFmpeg render failed", log: errorLog }, { status: 500 }));
        }
      });
    });

  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
