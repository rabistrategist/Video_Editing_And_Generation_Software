"use server";

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const COLAB_URL = "https://semialcoholic-globularly-devona.ngrok-free.dev";

export async function generateVideo(prompt: string): Promise<{success: boolean; url?: string; error?: string}> {
  return new Promise((resolve) => {
    try {
      const publicDir = path.join(process.cwd(), "public");
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      const filename = "generated_video.mp4";
      const savePath = path.join(publicDir, filename);

      const requestUrl = `${COLAB_URL}/generate?prompt=${encodeURIComponent(prompt)}`;
      const options = {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
        timeout: 0, // Disable timeout to let it wait as long as needed
      };

      const https = require('https');
      const req = https.get(requestUrl, options, (res: any) => {
        if (res.statusCode !== 200) {
          return resolve({ 
            success: false, 
            error: `Failed to generate video: ${res.statusCode} ${res.statusMessage}. The ngrok URL might have expired, or Colab timed out.` 
          });
        }

        const fileStream = fs.createWriteStream(savePath);
        res.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve({ success: true, url: `/${filename}?t=${Date.now()}` });
        });

        fileStream.on('error', (err: any) => {
          fs.unlink(savePath, () => {}); // Delete the file async
          console.error("File write error:", err);
          resolve({ success: false, error: err.message });
        });
      });

      req.on('error', (error: any) => {
        console.error("Request error:", error);
        resolve({ success: false, error: error.message });
      });
      
      // Some long-running requests can idle timeout
      req.on('timeout', () => {
        req.destroy();
        resolve({ success: false, error: "Request timed out waiting for Colab" });
      });

    } catch (error: any) {
      console.error("Error generating video:", error);
      resolve({ success: false, error: error.message });
    }
  });
}

// Ensure the filename is safe to use in shell commands
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9_\-\.]/g, '');
}
