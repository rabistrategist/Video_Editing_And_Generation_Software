# 🎬 AI-Powered Video Editing Studio

A modern, high-performance web-based video editor built with Next.js. It features a complete non-linear timeline, real-time canvas rendering, and built-in AI video generation using remote GPU clusters.

![Editor Preview](https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=2000&auto=format&fit=crop)

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
- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **UI Library:** [React 18](https://react.dev/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) (Global immutable editor state, history for Undo/Redo)
- **Styling:** CSS Modules / TailwindCSS + Glassmorphic UI design
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend & Video Processing
- **API Runtime:** Next.js Serverless Routes
- **Engine:** [FFmpeg](https://ffmpeg.org/) (Native child processes for advanced multi-layer video compositing)
- **AI Integration:** Secured webhook connections to Google Colab environments running state-of-the-art diffusion models.

---

## 💻 Getting Started

### Prerequisites
Make sure you have NodeJS installed and FFmpeg available in your system path.
```bash
# Verify ffmpeg is installed
ffmpeg -version
```

### Installation
1. Clone the repository and navigate into the main app directory.
2. Install the dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### AI Video Generation Setup
To use the AI text-to-video prompt feature, make sure your external GPU cluster (e.g., Google Colab) is running and the `COLAB_URL` environment flag inside `app/aivideo/actions.ts` successfully maps to your active generic ngrok endpoint.

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
