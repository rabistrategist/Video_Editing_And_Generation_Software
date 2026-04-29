import React, { useEffect } from "react";
import { X, Play, Pause } from "lucide-react";
import { useStore } from "../../store/useStore";
import dynamic from "next/dynamic";

const MainCanvas = dynamic(() => import("./MainCanvas"), { ssr: false });

export default function PreviewModal({ onClose }: { onClose: () => void }) {
  const { isPlaying, setIsPlaying, setSelectedLayerId } = useStore();

  useEffect(() => {
    // Clear selection on open so no transformers are shown
    setSelectedLayerId(null);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isPlaying, setIsPlaying, setSelectedLayerId]);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.95)', 
      display: 'flex', 
      flexDirection: 'column', 
      zIndex: 1000 
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ color: 'white', margin: 0, fontSize: '18px', fontWeight: 500 }}>Preview Mode</h2>
        <button 
          onClick={onClose} 
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-muted)', 
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s, color 0.2s'
          }}
          onMouseOver={e => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <X size={24} />
        </button>
      </div>

      {/* Main content - Canvas */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
        <MainCanvas />
      </div>

      {/* Controls */}
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0f0f15' }}>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          style={{ 
            background: 'var(--accent)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '50%', 
            width: '48px', 
            height: '48px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            cursor: 'pointer',
            transition: 'transform 0.1s, background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
      </div>
    </div>
  );
}
