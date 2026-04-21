---
description: How to integrate professional FFmpeg video export
---

1. Setup Backend Rendring Endpoint
   - Create `app/api/export/route.ts` to handle the rendering logic.
   - Install `fluent-ffmpeg` or use raw `child_process` to interface with the system FFmpeg binary.

2. Implement Asset Syncing
   - Create `app/api/upload/route.ts` to temporarily store media files used in the editor.
   - Update `Sidebar.tsx` to upload files as soon as they are added to the library.

3. Develop the Project-to-FFmpeg Compiler
   - Implement a utility to convert the Layer/Track JSON into an FFmpeg complex filter string.
   - Map properties: 
     - `x, y, width, height` -> `scale` and `overlay`.
     - `opacity` -> `colorchannelmixer`.
     - `startAt, duration` -> `trim` and `setpts`.
     - `color` -> `drawbox` or `fill`.

4. Update Export UI
   - Hook the "Export" button in `ExportModal.tsx` to the API.
   - Implement polling to fetch progress from a `/api/export/status` endpoint.
   - Provide the final file via a `Blob` or direct download link.

5. Test with Complex Scenarios
   - Multiple tracks, overlapping clips, and text overlays.
   - Different resolutions (720p vs 1080p).
