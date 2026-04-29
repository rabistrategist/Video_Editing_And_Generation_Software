import React, { useState, useEffect } from "react";
import { Download, X, AlertCircle } from "lucide-react";
import { useStore } from "../../store/useStore";

export default function ExportModal({ onClose }: { onClose: () => void }) {
  const { layers, tracks, canvas, duration } = useStore();
  const [format, setFormat] = useState("MP4");
  const [resolution, setResolution] = useState("1080p");
  const [quality, setQuality] = useState("High");
  const [fps, setFps] = useState("30");
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (exporting && progress < 90) {
      interval = setInterval(() => {
        setProgress(p => Math.min(90, p + (90 - p) * 0.1)); // Slow down as it approaches 90%
      }, 500);
    }
    return () => clearInterval(interval);
  }, [exporting, progress]);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setProgress(0);

    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layers,
          tracks,
          canvas,
          duration,
          settings: { format, resolution, quality, fps }
        })
      });

      const data = await res.json();

      if (data.success) {
        setProgress(100);
        
        try {
          if ('showSaveFilePicker' in window) {
            const ext = format.toLowerCase();
            const fileHandle = await (window as any).showSaveFilePicker({
              suggestedName: `export-${Date.now()}.${ext}`,
              types: [{
                description: 'Video File',
                accept: { [ext === 'mp4' ? 'video/mp4' : 'video/webm']: [`.${ext}`] }
              }]
            });
            
            const writable = await fileHandle.createWritable();
            const response = await fetch(data.url);
            
            if (response.body) {
              await response.body.pipeTo(writable);
            } else {
              const blob = await response.blob();
              await writable.write(blob);
              await writable.close();
            }
          } else {
            window.location.href = data.url;
          }
        } catch (saveErr: any) {
          if (saveErr.name === 'AbortError') {
            setExporting(false);
            setProgress(0);
            return;
          }
          throw new Error("Failed to save file: " + saveErr.message);
        }

        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error(data.error || "Export failed");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setExporting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ backgroundColor: 'var(--bg-panel)', padding: '24px', borderRadius: '12px', width: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={20} />
            Export Video
          </h2>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        {!exporting ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Format</label>
              <select value={format} onChange={e => setFormat(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '6px', color: 'white' }}>
                <option value="MP4">MP4 (H.264)</option>
                <option value="WebM">WebM (VP9)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Resolution</label>
              <select value={resolution} onChange={e => setResolution(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '6px', color: 'white' }}>
                <option value="480p">480p (854 x 480)</option>
                <option value="720p">720p (1280 x 720)</option>
                <option value="1080p">1080p (1920 x 1080)</option>
                <option value="4K">4K (3840 x 2160)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Quality</label>
              <select value={quality} onChange={e => setQuality(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '6px', color: 'white' }}>
                <option value="Low">Low (Fastest)</option>
                <option value="Medium">Medium</option>
                <option value="High">High (Recommended)</option>
                <option value="Ultra">Ultra (Slowest)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Frame Rate</label>
              <select value={fps} onChange={e => setFps(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '6px', color: 'white' }}>
                <option value="24">24 fps (Cinematic)</option>
                <option value="30">30 fps (Standard)</option>
                <option value="60">60 fps (Smooth)</option>
              </select>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={onClose}
                style={{ padding: '10px 16px', borderRadius: '6px', backgroundColor: 'transparent', color: 'white', fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                style={{ padding: '10px 24px', borderRadius: '6px', backgroundColor: 'var(--accent)', color: 'white', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '16px', marginBottom: '20px' }}>
              {progress < 100 ? 'Exporting your video...' : 'Export Complete! Starting download...'}
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-dark)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--accent)', transition: 'width 0.2s linear' }} />
            </div>
            <div style={{ marginTop: '10px', fontSize: '14px', color: 'var(--text-muted)' }}>
              {progress.toFixed(0)}%
            </div>
            {error && (
              <div style={{ marginTop: '20px', padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', color: '#ef4444', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
