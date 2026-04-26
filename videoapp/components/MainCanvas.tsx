import React, { useRef, useEffect, useState, useMemo } from "react";
import { Stage, Layer as KonvaLayer, Transformer, Rect, Circle, Text as KonvaText, Image as KonvaImage, Star, RegularPolygon } from "react-konva";
import useImage from "use-image";
import { useStore, LayerType, Layer } from "../store/useStore";
import Konva from "konva";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

// Suppress Konva warnings about multiple instances which often trigger false-positives in Next.js/HMR
if (typeof window !== "undefined") {
  (Konva as any).showWarnings = false;

  // Register custom properties for ShadowHighlightFilter if they don't exist
  // In Konva v10 (ESM), Factory may not be directly available, so we use manual prototype assignment
  if (!(Konva.Node.prototype as any).shadow) {
    (Konva.Node.prototype as any).shadow = function (this: any, val?: number) {
      if (arguments.length > 0) {
        this.setAttr('shadow', val);
        return this;
      }
      return this.getAttr('shadow');
    };
  }
  if (!(Konva.Node.prototype as any).highlight) {
    (Konva.Node.prototype as any).highlight = function (this: any, val?: number) {
      if (arguments.length > 0) {
        this.setAttr('highlight', val);
        return this;
      }
      return this.getAttr('highlight');
    };
  }
}

// Custom Shadow/Highlight Filter
const ShadowHighlightFilter = function (this: any, imageData: any) {
  const data = imageData.data;
  // Use the registered getter methods or fallback to getAttr
  const shadow = this.shadow ? this.shadow() : (this.getAttr('shadow') || 0);
  const highlight = this.highlight ? this.highlight() : (this.getAttr('highlight') || 0);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Simple luminosity
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Shadows (affects darker pixels)
    if (shadow !== 0 && luma < 128) {
      const factor = (shadow / 100) * (1 - luma / 128);
      data[i] = Math.min(255, Math.max(0, r + (255 - r) * factor));
      data[i + 1] = Math.min(255, Math.max(0, g + (255 - g) * factor));
      data[i + 2] = Math.min(255, Math.max(0, b + (255 - b) * factor));
    }

    // Highlights (affects brighter pixels)
    if (highlight !== 0 && luma > 128) {
      const factor = (highlight / 100) * ((luma - 128) / 128);
      data[i] = Math.min(255, Math.max(0, r + (255 - r) * factor));
      data[i + 1] = Math.min(255, Math.max(0, g + (255 - g) * factor));
      data[i + 2] = Math.min(255, Math.max(0, b + (255 - b) * factor));
    }
  }
};

const getTransitionStyle = (layer: Layer, currentTime: number) => {
  let { opacity = 1, x, y, width, height, flipX, flipY } = layer.transform;
  let scaleX = flipX ? -1 : 1;
  let scaleY = flipY ? -1 : 1;
  const inTrans = layer.transitions?.in;
  const outTrans = layer.transitions?.out;

  const timeInClip = currentTime - layer.startAt;
  const timeFromEnd = layer.startAt + layer.duration - currentTime;

  // In Transition
  if (inTrans && inTrans.type !== 'none' && timeInClip < inTrans.duration && timeInClip >= 0) {
    const progress = timeInClip / (inTrans.duration || 1); // 0 to 1
    if (inTrans.type === 'fade') opacity *= progress;
    else if (inTrans.type === 'slideRight') x -= width * (1 - progress);
    else if (inTrans.type === 'slideLeft') x += width * (1 - progress);
    else if (inTrans.type === 'zoomIn') {
      const scaleFactor = 0.5 + 0.5 * progress;
      scaleX *= scaleFactor;
      scaleY *= scaleFactor;
      x += (width - width * scaleFactor) / 2;
      y += (height - height * scaleFactor) / 2;
    }
  }

  // Out Transition
  if (outTrans && outTrans.type !== 'none' && timeFromEnd < outTrans.duration && timeFromEnd >= 0) {
    const progress = 1 - (timeFromEnd / (outTrans.duration || 1)); // 0 to 1
    if (outTrans.type === 'fade') opacity *= (1 - progress);
    else if (outTrans.type === 'slideRight') x += width * progress;
    else if (outTrans.type === 'slideLeft') x -= width * progress;
    else if (outTrans.type === 'zoomOut') {
      const scaleFactor = 1 - 0.5 * progress;
      scaleX *= scaleFactor;
      scaleY *= scaleFactor;
      x += (width - width * scaleFactor) / 2;
      y += (height - height * scaleFactor) / 2;
    }
  }

  return { x, y, opacity, scaleX, scaleY };
};

const VideoElement = ({ layer, isSelected, onSelect, onChange }: { layer: Layer, isSelected: boolean, onSelect: () => void, onChange: (newProps: any) => void }) => {
  const { currentTime, isPlaying } = useStore();
  const [canApplyFilters, setCanApplyFilters] = useState(true);
  const [imageFallback, setImageFallback] = useState(false);
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  // If it's an image, use layer.url or thumbnail with conditional CORS support
  const imageUrl = layer.type === 'image' ? layer.url || layer.thumbnail || "" : layer.thumbnail || "";
  const isExternalImage = imageUrl.startsWith('http') && !imageUrl.includes(typeof window !== 'undefined' ? window.location.host : '');
  const [image, imageStatus] = useImage(imageUrl, (isExternalImage && !imageFallback) ? "anonymous" : undefined);

  useEffect(() => {
    if (imageStatus === 'failed' && isExternalImage && !imageFallback) {
      console.warn(`Image failed to load with CORS: ${imageUrl}. Retrying without CORS (filters will be disabled).`);
      setImageFallback(true);
      setCanApplyFilters(false);
    }
  }, [imageStatus, isExternalImage, imageFallback, imageUrl]);
  const videoElement = useMemo(() => {
    const url = layer.url;
    if (typeof window === "undefined" || !url || layer.type !== 'video') return null;
    const vid = document.createElement("video");

    // Only use CORS for external URLs. Blobs and local paths don't need it.
    const isExternal = url.startsWith('http') && !url.includes(window.location.host);
    if (isExternal) {
      vid.crossOrigin = "anonymous";
    }

    vid.src = url;
    vid.muted = true;
    vid.playsInline = true;

    // Fallback if CORS fails
    vid.onerror = () => {
      // If it failed with crossOrigin, try without it
      if (vid.crossOrigin === "anonymous") {
        console.warn(`Video failed to load with CORS: ${url}. Retrying without CORS (filters will be disabled).`);
        setCanApplyFilters(false); // Mark as non-CORS to disable filter logic and avoid crashes
        vid.removeAttribute('crossOrigin');
        // Re-assign src to trigger reload
        vid.src = url;
      }
    };

    return vid;
  }, [layer.url, layer.type]);

  useEffect(() => {
    // Media duration updating has been moved to useStore to handle globally
    // whether the clip is actively visible or not.
  }, []);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Sync video time with playhead
  useEffect(() => {
    if (!videoElement || layer.type !== 'video') return;

    // Determine if this layer should be visible and playing
    const relativeTime = currentTime - layer.startAt;
    const track = useStore.getState().tracks.find(t => t.id === layer.track);
    const isVisible = currentTime >= layer.startAt && currentTime < layer.startAt + layer.duration;

    // Apply track volume & master volume with transition fade out/in
    const masterVolume = useStore.getState().masterVolume;
    let targetVolume = Math.max(0, Math.min(1, (track?.volume ?? 1) * masterVolume));
    
    // Audio Fade Transitions
    const timeInClip = currentTime - layer.startAt;
    const timeFromEnd = layer.startAt + layer.duration - currentTime;
    if (layer.transitions?.in?.type === 'fade' && timeInClip < layer.transitions.in.duration && timeInClip >= 0) {
      targetVolume *= (timeInClip / layer.transitions.in.duration);
    }
    if (layer.transitions?.out?.type === 'fade' && timeFromEnd < layer.transitions.out.duration && timeFromEnd >= 0) {
      targetVolume *= (timeFromEnd / layer.transitions.out.duration);
    }

    videoElement.muted = track?.isMuted || false;
    videoElement.volume = targetVolume;
    videoElement.playbackRate = layer.transform?.speed || 1;

    if (isVisible) {
      const mediaTime = (relativeTime * (layer.transform?.speed || 1)) + (layer.trimStart || 0);
      if (Math.abs(videoElement.currentTime - mediaTime) > 0.5 || !isPlaying) {
        videoElement.currentTime = mediaTime;
      }
      if (isPlaying && videoElement.paused) {
        // Only try to play if we actually have enough data to do so to avoid NotSupportedError
        if (videoElement.readyState >= 2) {
          const playPromise = videoElement.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // Silently catch to prevent console spam
            });
          }
        }
      } else if (!isPlaying && !videoElement.paused) {
        videoElement.pause();
      }
    } else {
      if (!videoElement.paused) videoElement.pause();
    }
  }, [currentTime, isPlaying, layer.startAt, layer.duration, videoElement, layer.track]);

  useEffect(() => {
    if (shapeRef.current) {
      const node = shapeRef.current;
      const adjustments = layer.adjustments;
      const media = layer.type === 'video' ? videoElement : image;

      // We only apply filters and cache if the media content is actually ready.
      // Caching an empty node would result in a transparent/invisible element.
      if (canApplyFilters && media) {
        // Apply filters only if we have CORS to avoid "Tainted Canvas" error
        const filterList = [Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSV, ShadowHighlightFilter];
        node.filters(filterList);

        // Set properties
        node.brightness(adjustments.brightness);
        node.contrast(adjustments.contrast);
        node.saturation(adjustments.saturation); // Konva.Filters.HSV uses saturation property
        (node as any).shadow(adjustments.shadow);
        (node as any).highlight(adjustments.highlight);

        // Mandatory cache for filters
        // For video, we will re-cache in the animation loop if playing
        node.cache();
      } else {
        // Disable filters and clear cache for tainted or non-loaded resources to prevent crashes/invisibility
        node.filters([]);
        node.clearCache();
      }

      node.getLayer()?.batchDraw();
    }
  }, [layer.adjustments, layer.id, canApplyFilters, image, videoElement, layer.type]);

  const animRef = useRef<Konva.Animation | null>(null);
  // Critically important: if boundaries change, cache must be cleared so it can redraw.
  useEffect(() => {
    if (shapeRef.current) {
      shapeRef.current.clearCache();
    }
  }, [layer.transform.width, layer.transform.height]);

  useEffect(() => {
    if (videoElement && shapeRef.current && layer.type === 'video') {
      const node = shapeRef.current;
      const layerNode = node.getLayer();

      const hasFilters = layer.adjustments &&
        (layer.adjustments.brightness !== 0 || layer.adjustments.contrast !== 0 ||
          layer.adjustments.saturation !== 0 || layer.adjustments.shadow !== 0 ||
          layer.adjustments.highlight !== 0);

      animRef.current = new Konva.Animation(() => {
        // To apply filters to video, we must re-cache every frame
        // This is expensive, so we only do it if video is actually playing or being scrubbed
        // We only cache if we have CORS and filters are applied.
        if (canApplyFilters && hasFilters && (isPlaying || !videoElement.paused)) {
          node.cache();
        }
      }, layerNode);

      // If we don't need filters we must ensure cache is cleared so native element renders correctly
      if (!hasFilters || !canApplyFilters) {
        node.clearCache();
      }

      if (isPlaying) {
        animRef.current.start();
      } else {
        animRef.current.stop();
        layerNode?.batchDraw();
      }
    }
    return () => { animRef.current?.stop(); };
  }, [isPlaying, videoElement, layer.id, canApplyFilters]);

  if (!layer.isVisible || currentTime < layer.startAt || currentTime >= layer.startAt + layer.duration) {
    return null;
  }

  const transitionStyle = getTransitionStyle(layer, currentTime);

  return (
    <>
      <KonvaImage
        image={layer.type === 'video' && videoElement ? videoElement : image}
        ref={shapeRef}
        x={transitionStyle.x + layer.transform.width / 2}
        y={transitionStyle.y + layer.transform.height / 2}
        offsetX={layer.transform.width / 2}
        offsetY={layer.transform.height / 2}
        width={layer.transform.width}
        height={layer.transform.height}
        rotation={layer.transform.rotation}
        opacity={transitionStyle.opacity}
        scaleX={transitionStyle.scaleX}
        scaleY={transitionStyle.scaleY}
        onClick={onSelect}
        onTap={onSelect}
        draggable
        onDragEnd={(e) => {
          onChange({
            transform: {
              ...layer.transform,
              x: e.target.x() - layer.transform.width / 2,
              y: e.target.y() - layer.transform.height / 2
            }
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // Reset scale to 1 in the node so that re-renders with width/height are clean
          node.scaleX(1);
          node.scaleY(1);

          const newWidth = Math.max(5, Math.abs(layer.transform.width * scaleX));
          const newHeight = Math.max(5, Math.abs(layer.transform.height * scaleY));

          onChange({
            transform: {
              ...layer.transform,
              x: node.x() - newWidth / 2,
              y: node.y() - newHeight / 2,
              rotation: node.rotation(),
              // We use the current state's width/height as the base for scaling
              // to avoid issues with node.width() during initial load or flipping.
              width: newWidth,
              height: newHeight,
              flipX: scaleX < 0,
              flipY: scaleY < 0,
            }
          });
        }}
      />
      {isSelected && (
        <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => newBox.width < 5 || newBox.height < 5 ? oldBox : newBox} />
      )}
    </>
  );
};

const AudioElement = ({ layer }: { layer: Layer }) => {
  const { currentTime, isPlaying, tracks } = useStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = document.createElement("audio");
    audio.src = layer.url || "";
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [layer.url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const track = tracks.find(t => t.id === layer.track);
    const isTrackVisible = track?.isVisible !== false;

    // Apply track volume / mute & master volume
    const masterVolume = useStore.getState().masterVolume;
    let targetVolume = Math.max(0, Math.min(1, (track?.volume ?? 1) * masterVolume));

    // Audio Fade Transitions
    const timeInClip = currentTime - layer.startAt;
    const timeFromEnd = layer.startAt + layer.duration - currentTime;
    if (layer.transitions?.in?.type === 'fade' && timeInClip < layer.transitions.in.duration && timeInClip >= 0) {
      targetVolume *= (timeInClip / layer.transitions.in.duration);
    }
    if (layer.transitions?.out?.type === 'fade' && timeFromEnd < layer.transitions.out.duration && timeFromEnd >= 0) {
      targetVolume *= (timeFromEnd / layer.transitions.out.duration);
    }

    audio.muted = track?.isMuted || false;
    audio.volume = targetVolume;
    audio.playbackRate = layer.transform?.speed || 1;

    // Check if within bounds and track is visible
    const isVisible = layer.isVisible && isTrackVisible && currentTime >= layer.startAt && currentTime < layer.startAt + layer.duration;

    if (isVisible) {
      const mediaTime = (currentTime - layer.startAt) * (layer.transform?.speed || 1) + (layer.trimStart || 0);

      if (Math.abs(audio.currentTime - mediaTime) > 0.5 || !isPlaying) {
        audio.currentTime = mediaTime;
      }
      if (isPlaying && audio.paused) {
        if (audio.readyState >= 2) {
          audio.play().catch(() => { });
        }
      } else if (!isPlaying && !audio.paused) {
        audio.pause();
      }
    } else {
      if (!audio.paused) audio.pause();
    }
  }, [currentTime, isPlaying, layer.startAt, layer.duration, layer.trimStart, layer.isVisible, layer.track, tracks]);

  return null;
};

const ShapeElement = ({ layer, isSelected, onSelect, onChange }: any) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const { currentTime } = useStore();
  const transitionStyle = getTransitionStyle(layer, currentTime);

  const isCenterBased = layer.content === 'circle' || layer.content === 'triangle' || layer.content === 'star';

  const commonProps = {
    x: transitionStyle.x + layer.transform.width / 2,
    y: transitionStyle.y + layer.transform.height / 2,
    offsetX: isCenterBased ? 0 : layer.transform.width / 2,
    offsetY: isCenterBased ? 0 : layer.transform.height / 2,
    width: layer.transform.width,
    height: layer.transform.height,
    rotation: layer.transform.rotation,
    opacity: transitionStyle.opacity,
    fill: layer.color || 'white',
    draggable: true,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e: any) => onChange({ transform: { ...layer.transform, x: e.target.x() - layer.transform.width / 2, y: e.target.y() - layer.transform.height / 2 } }),
    onTransformEnd: (e: any) => {
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      node.scaleX(1);
      node.scaleY(1);

      const newWidth = Math.max(5, Math.abs(layer.transform.width * scaleX));
      const newHeight = Math.max(5, Math.abs(layer.transform.height * scaleY));

      const updates: any = {
        transform: {
          ...layer.transform,
          x: node.x() - newWidth / 2,
          y: node.y() - newHeight / 2,
          rotation: node.rotation(),
          width: newWidth,
          height: newHeight,
          flipX: scaleX < 0,
          flipY: scaleY < 0
        }
      };

      if (layer.type === 'text' || layer.type === 'emoji') {
        updates.fontSize = Math.max(1, (layer.fontSize || 20) * Math.max(Math.abs(scaleX), Math.abs(scaleY)));
      }

      onChange(updates);
    }
  };

  let element;
  if (layer.content === 'circle') {
    element = (
      <Circle
        ref={shapeRef}
        {...commonProps}
        radius={layer.transform.width / 2}
        width={undefined}
        height={undefined}
        scaleX={transitionStyle.scaleX}
        scaleY={transitionStyle.scaleY}
      />
    );
  } else if (layer.type === 'text' || layer.type === 'emoji') {
    let fontStyle = '';
    if (layer.isBold) fontStyle += 'bold ';
    if (layer.isItalic) fontStyle += 'italic';
    fontStyle = fontStyle.trim() || 'normal';

    element = (
      <KonvaText
        ref={shapeRef}
        {...commonProps}
        width={layer.type === 'emoji' ? undefined : layer.transform.width}
        height={layer.type === 'emoji' ? undefined : layer.transform.height}
        text={layer.content}
        fill={layer.color || 'white'}
        fontSize={layer.fontSize || (layer.type === 'emoji' ? 80 : 20)}
        fontFamily={layer.font || 'Arial'}
        fontStyle={fontStyle}
        textDecoration={layer.isUnderline ? 'underline' : ''}
        align={layer.align || "center"}
        verticalAlign={layer.verticalAlign || "middle"}
        padding={0}
        scaleX={transitionStyle.scaleX}
        scaleY={transitionStyle.scaleY}
      />
    );
  } else if (layer.content === 'triangle') {
    element = (
      <RegularPolygon
        ref={shapeRef}
        {...commonProps}
        sides={3}
        radius={layer.transform.width / 2}
        width={layer.transform.width}
        height={layer.transform.height}
        scaleX={transitionStyle.scaleX}
        scaleY={transitionStyle.scaleY}
      />
    );
  } else if (layer.content === 'star') {
    element = (
      <Star
        ref={shapeRef}
        {...commonProps}
        numPoints={5}
        innerRadius={layer.transform.width / 4}
        outerRadius={layer.transform.width / 2}
        width={layer.transform.width}
        height={layer.transform.height}
        scaleX={transitionStyle.scaleX}
        scaleY={transitionStyle.scaleY}
      />
    );
  } else {
    element = (
      <Rect
        ref={shapeRef}
        {...commonProps}
        scaleX={transitionStyle.scaleX}
        scaleY={transitionStyle.scaleY}
      />
    );
  }

  return (
    <>
      {element}
      {isSelected && <Transformer ref={trRef} boundBoxFunc={(oldBox, newBox) => newBox.width < 5 || newBox.height < 5 ? oldBox : newBox} />}
    </>
  );
}

export default function MainCanvas() {
  const {
    canvas,
    layers,
    currentTime, setCurrentTime,
    selectedLayerId, setSelectedLayerId,
    updateLayer,
    addLayer,
    tracks,
    isPlaying, setIsPlaying,
    duration,
    masterVolume, setMasterVolume
  } = useStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5); // Default to smaller instead of full scale
  const [isClient, setIsClient] = useState(false);

  // Format time as MM:SS.ms
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setIsClient(true);

    // Set initial scale aggressively before ResizeObserver fires
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      if (width > 0 && height > 0) {
        const scaleW = (width - 80) / canvas.width;
        const scaleH = (height - 80) / canvas.height;
        setScale(Math.min(scaleW, scaleH));
      }
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        const scaleW = (width - 80) / canvas.width;
        const scaleH = (height - 80) / canvas.height;
        const newScale = Math.min(scaleW, scaleH);
        setScale(prev => Math.abs(prev - newScale) > 0.001 ? newScale : prev);
      }
    });

    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [canvas.width, canvas.height]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const scaleW = (width - 80) / canvas.width;
        const scaleH = (height - 80) / canvas.height;
        const newScale = Math.min(scaleW, scaleH);
        setScale(prev => Math.abs(prev - newScale) > 0.001 ? newScale : prev);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvas.width, canvas.height]);

  const activeLayers = layers.filter(layer => {
    const track = tracks.find(t => t.id === layer.track);
    const isTrackVisible = track?.isVisible !== false;
    return layer.isVisible && isTrackVisible && currentTime >= layer.startAt && currentTime < layer.startAt + layer.duration;
  }).sort((a, b) => {
    const indexA = tracks.findIndex(t => t.id === a.track);
    const indexB = tracks.findIndex(t => t.id === b.track);
    return indexB - indexA; // Higher track index in tracks array (which means lower in the list) should be rendered first
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    try {
      const dataStr = e.dataTransfer.getData('application/x-editor-layer') || e.dataTransfer.getData('text/plain');
      if (!dataStr || !dataStr.startsWith('{')) return;
      let data = JSON.parse(dataStr);

      if (data.type === 'applyTransition') {
        const transData = data.payload;
        if (selectedLayerId) {
          const selectedLayer = layers.find(l => l.id === selectedLayerId);
          if (selectedLayer) {
            const newTransitions = { ...selectedLayer.transitions };
            if (transData.category === 'in') {
              newTransitions.in = { type: transData.type, duration: 1 };
            } else {
              newTransitions.out = { type: transData.type, duration: 1 };
            }
            updateLayer(selectedLayerId, { transitions: newTransitions });
          }
        }
        return;
      }

      // If the data came from our Sidebar, it is wrapped in an 'addLayer' event.
      // We need to extract the actual layer payload.
      if (data.type === 'addLayer' && data.payload) {
        data = data.payload;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const stageRect = {
        x: containerRect.width / 2 - (canvas.width * scale) / 2,
        y: containerRect.height / 2 - (canvas.height * scale) / 2
      };

      const newLayer = { ...data };
      // Map to center of canvas
      if (newLayer.transform && newLayer.type !== 'audio') {
        newLayer.transform.x = (canvas.width - (newLayer.transform.width || 0)) / 2;
        newLayer.transform.y = (canvas.height - (newLayer.transform.height || 0)) / 2;
      }

      // Create a new track by leaving track id undefined
      delete newLayer.track;

      newLayer.startAt = Math.max(0, currentTime);
      addLayer(newLayer);
    } catch (err) {
      console.error("Failed to parse drop target:", err);
    }
  };

  if (!isClient) return <div style={{ flex: 1, backgroundColor: '#000' }} />;

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ flex: 1, backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
    >
      <div
        style={{
          width: canvas.width * scale,
          height: canvas.height * scale,
          backgroundColor: canvas.backgroundColor,
          position: 'relative',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}
      >
        <Stage
          width={canvas.width * scale}
          height={canvas.height * scale}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={(e) => {
            const clickedOnEmpty = e.target === e.target.getStage();
            if (clickedOnEmpty) {
              setSelectedLayerId(null);
            }
          }}
        >
          <KonvaLayer>
            {activeLayers.map((layer) => {
              if (layer.type === 'video' || layer.type === 'image') {
                return <VideoElement key={layer.id} layer={layer} isSelected={selectedLayerId === layer.id} onSelect={() => setSelectedLayerId(layer.id)} onChange={(updates) => updateLayer(layer.id, updates)} />;
              } else {
                return <ShapeElement key={layer.id} layer={layer} isSelected={selectedLayerId === layer.id} onSelect={() => setSelectedLayerId(layer.id)} onChange={(updates: any) => updateLayer(layer.id, updates)} />;
              }
            })}
          </KonvaLayer>
        </Stage>

        {/* Empty Canvas Overlay */}
        {layers.length === 0 && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: `${28 * scale}px`, // Scale font size so it remains consistent relative to canvas
            letterSpacing: '0.05em',
            userSelect: 'none'
          }}>
            Hi!👋 Let's Start Editing
          </div>
        )}
      </div>

      {/* Hidden Audio Elements */}
      {layers.filter(l => l.type === 'audio').map(layer => (
        <AudioElement key={layer.id} layer={layer} />
      ))}

      {/* Floating Canvas Player Controls */}
      <div style={{
        position: 'absolute',
        bottom: '0px',    
        width:'100%',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(20, 20, 30, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        zIndex: 50,
        color: 'white'
      }}>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          {isPlaying ? <Pause size={16} fill="white" /> : <Play size={16} fill="white" style={{ marginLeft: '2px' }} />}
        </button>

        <span style={{ fontSize: '13px', fontFamily: 'monospace', minWidth: '60px' }}>{formatTime(currentTime)}</span>

        <input
          type="range"
          min="0"
          max={Math.max(duration, 0.1)}
          step="0.01"
          value={currentTime}
          onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
          style={{ width: '600px', height: '4px', accentColor: 'var(--accent)', cursor: 'pointer' }}
        />

        <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.1)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setMasterVolume(masterVolume === 0 ? 1 : 0)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0', display: 'flex' }}
          >
            {masterVolume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={masterVolume}
            onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
            style={{ width: '60px', height: '4px', accentColor: 'var(--text-main)', cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
}
