
https://github.com/user-attachments/assets/b798ff48-d29f-483e-b375-b69584ead234
# 🎬 AI-Powered Video Editing Studio

A modern, high-performance web-based video editor built with Next.js. It features a complete non-linear timeline, real-time canvas rendering, and built-in AI video generation using remote GPU clusters.

Project Demo: Uploading clideo_editor_db936199ab6549708704aa7e2903a237.mp4…

## ✨ Core Features

### 🎞️ Advanced Non-Linear Editing
- **Multi-Track Timeline:** Layer videos, audio, text, images, and shapes limitlessly.
- **Precision Trimming & Splitting:** Cut, slice, and trim clips right on the timeline.
- **Keyframe Controls:** Fine-tune clip speed (slow-mo/time-lapse), opacity, and volume.

### 🤖 Generative AI Video
- **Text-to-Video Engine:** Built-in connection to a remote Colab GPU cluster via ngrok for generating videos from text prompts.
- **Seamless Integration:** Instantly drop generated AI clips directly into your editing timeline with a single click.

### 🎨 Visual & Audio Effects
- **Color Grading:** Adjust Brightness, Contrast, Saturation, Shadows, and Highlights per clip.
- **Transitions:** Smooth Fade, Slide (Left/Right), and Zoom animations.
- **Rich Text & Shapes:** Overlay fully customizable typography and shapes.

### 🚀 High-Fidelity FFmpeg Rendering
- **Complex Filter Graphs:** Uses a highly customized server-side FFmpeg pipeline to accurately render timelines, positions, offsets, and filters.
- **Lossless Exports:** Export in MP4 (H.264) or WebM (VP9).
- **Multiple Resolutions:** Render all the way from standard 480p up to pristine 4K at 24/30/60 FPS.

---

## 🛠️ Tech Stack

### Frontend Architecture
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **UI Library:** [React 19](https://react.dev/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (Global immutable editor state with Snapshot-based Undo/Redo)
- **Styling:** Vanilla CSS (Custom Glassmorphic Design System)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Canvas Engine:** [Konva.js](https://konvajs.org/) (High-performance 2D canvas for real-time editing)

### Backend & Video Processing
- **API Runtime:** Next.js Serverless Routes (Node.js)
- **Processing Engine:** [FFmpeg](https://ffmpeg.org/) (Native child processes for advanced multi-layer compositing)
- **AI Integration:** Secure HTTP streaming from remote Google Colab GPU clusters via ngrok.

---

## 🤖 Generative AI & Colab GPU Integration

To enable high-end AI video generation without requiring an expensive local GPU, this project leverages a hybrid architecture that connects to a remote **Google Colab** instance.

### 1. The Architecture
- **Frontend (Next.js):** Handles the user interface, prompt input, and video editing.
- **Backend (Server Actions):** Orchestrates the request to the GPU cluster.
- **GPU Cluster (Colab):** A Python-based server running on Google Colab that uses models like Stable Video Diffusion (SVD) or similar to generate videos.

### 2. Connectivity via Ngrok
Since Google Colab runs in a private cloud environment, we use **ngrok** to create a secure tunnel:
1. The Colab notebook starts a local Flask/FastAPI server on port `5000`.
2. `ngrok` exposes this port to a public URL (configured in `videoapp/app/aivideo/actions.ts`).

### 3. The Generation Workflow
1. **User Request:** The user enters a prompt in the "AI Video" tab.
2. **Server Action:** The `generateVideo` function sends a secured request to the Colab endpoint.
3. **Remote Processing:** Colab generates the video using its GPU and streams the file back.
4. **Stream & Pipe:** The Next.js server pipes the stream directly into the `public/` folder.
5. **Instant Loading:** Once finished, the new clip is added to the sidebar library and timeline.

---

## ⚙️ FFmpeg Integration & Rendering Pipeline

This project uses **FFmpeg** as its core rendering engine. It handles complex non-linear editing by converting the frontend's JSON-based timeline into a high-performance filter graph on the server.

### 1. Installation Guide
To run the export feature locally, FFmpeg must be installed and available in your system's `PATH`.

- **Linux:** `sudo apt install ffmpeg`
- **macOS:** `brew install ffmpeg`
- **Windows:** Download from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) and add to your System `Path`.

### 2. Implementation Details
The integration is located in `videoapp/app/api/export/route.ts`. It works by spawning a child process from the Node.js backend using `child_process.spawn`.

### 3. How it Works (The Stacking & Mixing Engine)

The power of the project lies in how it dynamically generates a **"Filter Complex Graph"**. When you have dozens of elements, FFmpeg doesn't process them one by one; it builds a massive map of instructions:

#### **A. Multi-Input Stacking (Visuals)**
- **Input Streams:** Every video, image, emoji, and shape is treated as a separate input index (e.g., `-i video1.mp4`, `-i image2.png`).
- **Recursive Overlays:** The engine uses a "Chain-Link" logic. It starts with Input 0 (the background color) and overlays Input 1. The result of that becomes the background for Input 2, and so on. 
  - *Example Logic:* `[bg][v1]overlay[tmp1]; [tmp1][v2]overlay[tmp2]; [tmp2][v3]overlay[final_video]`
- **Coordinate Mapping:** Every `(x, y)` coordinate and `(width, height)` from the browser's canvas is mathematically scaled to the final render resolution (e.g., 4K) so the output looks identical to the preview.

#### **B. Parallel Audio Mastering**
- **Independent Trimming:** Every audio source is trimmed and synced to its specific `startAt` time using `atrim`.
- **Syncing with `adelay`:** Since different clips start at different times, we apply precise delays (in milliseconds) to every audio stream so they align perfectly with the visual elements.
- **The Global Mix:** All processed audio streams are funneled into an `amix` filter which flattens them into a single, high-quality stereo or 5.1 surround sound track.

#### **C. Single-Pass Flattening**
Instead of rendering each layer to a file and then combining them (which would lose quality), FFmpeg performs all these transformations in **RAM** during a single pass. This ensures that the final MP4 or WebM file is encoded with maximum clarity and no generational loss.

---

## 💻 Getting Started

### Prerequisites
Make sure you have NodeJS installed and FFmpeg available in your system path.

### Installation
1. Clone the repository and navigate into the main app directory.
2. Install the dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📁 Project Structure

- `/app`: Next.js page routing and API routes (such as `/api/export` handling the complex FFmpeg engine).
- `/components`: Contains isolated, reusable layout modules (`MainCanvas`, `Timeline`, `PropertiesPanel`, `ExportModal`).
- `/store`: Zustand global state architecture managing `useStore.ts`.
- `/temp`: Temporary server storage generated for file uploads and output renders.
- `/public`: Contains local assets and cached AI video generations.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
