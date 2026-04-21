import React, { useState, useRef, useEffect } from "react";
import { Download, MonitorPlay, Undo, Redo, LayoutGrid } from "lucide-react";
import { useStore } from "../store/useStore";


export default function Navbar({ onExport, onPreview }: { onExport: () => void, onPreview: () => void }) {
  const undo = useStore(state => state.undo);
  const redo = useStore(state => state.redo);
  const canUndo = useStore(state => state.past.length > 0);
  const canRedo = useStore(state => state.future.length > 0);

  const [projectName, setProjectName] = useState("Untitled Project");
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleProjectRename = () => {
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditing(false);
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };
  return (
    <div style={{
      height: '60px',
      backgroundColor: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600, fontSize: '18px' }}>
          <LayoutGrid size={20} color="var(--accent)" />
          Video Editor
        </div>
        
        <div> 
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={handleKeyDown}
            style={{
              backgroundColor: 'var(--bg-dark)',
              border: '1px solid var(--accent)',
              borderRadius: '4px',
              padding: '4px 12px',
              fontSize: '14px',
              color: 'var(--text-main)',
              outline: 'none',
              width: '200px'
            }}
          />
        ) : (
          <div
            onClick={handleProjectRename}
            style={{
              padding: '4px 12px',
              backgroundColor: 'var(--bg-dark)',
              borderRadius: '4px',
              fontSize: '14px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              border: '1px solid transparent',
              transition: 'border-color 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = 'var(--border)'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
          >
            {projectName}
          </div>
        )}
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={undo}
          disabled={!canUndo}
          style={{ 
            color: canUndo ? 'var(--text-main)' : 'var(--text-muted)', 
            background: 'transparent', 
            border: 'none', 
            cursor: canUndo ? 'pointer' : 'default',
            padding: '6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            opacity: canUndo ? 1 : 0.5
          }}
          onMouseOver={e => canUndo && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
          onMouseOut={e => canUndo && (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Undo (Ctrl+Z)"
        >
          <Undo size={18} />
        </button>
        <button 
          onClick={redo}
          disabled={!canRedo}
          style={{ 
            color: canRedo ? 'var(--text-main)' : 'var(--text-muted)', 
            background: 'transparent', 
            border: 'none', 
            cursor: canRedo ? 'pointer' : 'default',
            padding: '6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            opacity: canRedo ? 1 : 0.5
          }}
          onMouseOver={e => canRedo && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
          onMouseOut={e => canRedo && (e.currentTarget.style.backgroundColor = 'transparent')}
          title="Redo (Ctrl+Y)"
        >
          <Redo size={18} />
        </button>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)', margin: '0 8px' }} />
        <button 
          onClick={onPreview}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: '4px' }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
        <MonitorPlay size={20} />
          Preview
        </button>
        <button 
          onClick={onExport}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--accent)'}
        >
          <Download size={16} />
          Export
        </button>
      </div>
    </div>
  );
}
