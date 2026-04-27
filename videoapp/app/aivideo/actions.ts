"use server";

import fs from "fs";
import path from "path";

const COLAB_URL = "https://semialcoholic-globularly-devona.ngrok-free.dev";

// Parse "24 FPS" → 24, "540p" → 540, "5 seconds" → 5
function parseFps(fps: string): number {
  const n = parseInt(fps);
  return isNaN(n) ? 24 : n;
}
function parseDuration(duration: string): number {
  const n = parseInt(duration);
  return isNaN(n) ? 5 : n;
}

export type VideoSettings = {
  model: string;        // HuggingFace model ID, e.g. "damo-vilab/text-to-video-ms-1.7b"
  resolution: string;  // e.g. "540p"
  fps: string;         // e.g. "24 FPS"
  duration: string;    // e.g. "5 seconds"
  aspectRatio: string; // e.g. "Widescreen (16:9)"
};

export async function generateVideo(
  prompt: string,
  settings: VideoSettings
): Promise<{ success: boolean; url?: string; error?: string }> {
  return new Promise((resolve) => {
    try {
      const publicDir = path.join(process.cwd(), "public");
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      const timestamp = Date.now();
      const filename = `ai-video-${timestamp}.mp4`;
      const savePath = path.join(publicDir, filename);

      // Build URL — pass all settings as query params so Colab can use them
      const params = new URLSearchParams({
        prompt,
        model:      settings.model,
        resolution: settings.resolution,
        fps:        String(parseFps(settings.fps)),
        duration:   String(parseDuration(settings.duration)),
        aspect:     settings.aspectRatio,
      });

      const requestUrl = `${COLAB_URL}/generate?${params.toString()}`;

      const https = require("https");
      const req = https.get(
        requestUrl,
        {
          headers: { "ngrok-skip-browser-warning": "true" },
          timeout: 0, // no timeout — generation can take several minutes
        },
        (res: any) => {
          if (res.statusCode !== 200) {
            return resolve({
              success: false,
              error: `Server returned ${res.statusCode} ${res.statusMessage}. ` +
                     `The ngrok URL may have expired or Colab timed out.`,
            });
          }

          const fileStream = fs.createWriteStream(savePath);
          res.pipe(fileStream);

          fileStream.on("finish", () => {
            fileStream.close();
            resolve({ success: true, url: `/${filename}` });
          });

          fileStream.on("error", (err: any) => {
            fs.unlink(savePath, () => {});
            resolve({ success: false, error: err.message });
          });
        }
      );

      req.on("error", (err: any) => {
        resolve({ success: false, error: err.message });
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({ success: false, error: "Request timed out waiting for Colab." });
      });

    } catch (error: any) {
      resolve({ success: false, error: error.message });
    }
  });
}