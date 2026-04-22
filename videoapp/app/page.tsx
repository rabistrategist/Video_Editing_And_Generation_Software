"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Clapperboard } from "lucide-react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
const MainCanvas = dynamic(() => import("../components/MainCanvas"), { ssr: false });
import PropertiesPanel from "../components/PropertiesPanel";
import Timeline from "../components/Timeline";
import ExportModal from "../components/ExportModal";
import PreviewModal from "../components/PreviewModal";
import { useStore } from "../store/useStore";

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = "Edit Clip";
  const undo = useStore(state => state.undo);
  const redo = useStore(state => state.redo);
  const addLayer = useStore(state => state.addLayer);
  
  const handledVideoRef = React.useRef<string | null>(null);

  // Handle auto-loading video from query params
  React.useEffect(() => {
    const videoUrl = searchParams.get('videoUrl');
    if (videoUrl && handledVideoRef.current !== videoUrl) {
      handledVideoRef.current = videoUrl;

      // Prevent adding if it's already on the canvas
      const alreadyExists = useStore.getState().layers.some(layer => layer.url === videoUrl);
      
      if (!alreadyExists) {
        // Add the video layer
        addLayer({
        type: 'video',
        name: 'AI Generated Video',
        url: videoUrl,
        startAt: 0,
        duration: 10, // Default duration, store updates it on metadata load
        isVisible: true,
        isLocked: false,
        transform: {
          x: 0,
          y: 0,
          width: 1920,
          height: 1080,
          rotation: 0,
          opacity: 1,
          speed: 1,
          flipX: false,
          flipY: false
        }
      });
      }
      
      // Clear the query param without refreshing the page
      router.replace('/', { scroll: false });
    }
  }, [searchParams, addLayer, router]);

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      
      if (isCtrlOrCmd && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (isCtrlOrCmd && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [undo, redo]);

  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [timelineHeight, setTimelineHeight] = useState(300);
  const [propertiesWidth, setPropertiesWidth] = useState(300);
  const [trackHeaderWidth, setTrackHeaderWidth] = useState(250); // Increased default width
  const [isResizingTimeline, setIsResizingTimeline] = useState(false);
  const [isResizingProperties, setIsResizingProperties] = useState(false);
  const [isResizingTrackHeader, setIsResizingTrackHeader] = useState(false);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingTimeline) {
        const newHeight = window.innerHeight - e.clientY;
        setTimelineHeight(Math.max(100, Math.min(600, newHeight)));
      }
      if (isResizingProperties) {
        const newWidth = window.innerWidth - e.clientX;
        setPropertiesWidth(Math.max(200, Math.min(500, newWidth)));
      }
      if (isResizingTrackHeader) {
        const newWidth = e.clientX; 
        setTrackHeaderWidth(Math.max(200, Math.min(500, newWidth))); // Increased min constraint
      }
    };

    const handleMouseUp = () => {
      setIsResizingTimeline(false);
      setIsResizingProperties(false);
      setIsResizingTrackHeader(false);
      document.body.style.cursor = 'default';
    };

    if (isResizingTimeline || isResizingProperties || isResizingTrackHeader) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingTimeline, isResizingProperties, isResizingTrackHeader]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0f0f15', color: 'var(--text-main)', userSelect: isResizingTimeline || isResizingProperties || isResizingTrackHeader ? 'none' : 'auto' }}>
      <Navbar onExport={() => setIsExporting(true)} onPreview={() => setIsPreviewing(true)}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px', height: '100%', marginLeft: '82px'}}>
          {[
            { id: 'Generate', label: 'Generate', Icon: Sparkles },
            { id: 'Edit Clip', label: 'Edit Clip', Icon: Clapperboard }
          ].map(({ id, label, Icon }) => (
            <div
              key={id}
              onClick={() => {
                if (id !== 'Edit Clip') {
                  router.push('/aivideo');
                }
              }}
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 4px',
                borderBottom: activeTab === id ? '2px solid var(--accent)' : '2px solid transparent',
                color: activeTab === id ? 'var(--text-main)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
              onMouseOver={e => activeTab !== id && (e.currentTarget.style.color = 'var(--text-main)')}
              onMouseOut={e => activeTab !== id && (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Icon size={16} />
              {label}
            </div>
          ))}
        </nav>
      </Navbar>
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        <Sidebar />
        <MainCanvas />
        
        {/* Resize Handle for Properties Panel */}
        <div 
          onMouseDown={() => {
            setIsResizingProperties(true);
            document.body.style.cursor = 'ew-resize';
          }}
          style={{ 
            width: '4px', 
            cursor: 'ew-resize', 
            position: 'absolute', 
            right: propertiesWidth - 2, 
            top: 0, 
            bottom: 0, 
            zIndex: 100,
            transition: 'background 0.2s',
            backgroundColor: isResizingProperties ? 'var(--accent)' : 'transparent'
          }}
          onMouseOver={e => !isResizingProperties && (e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.3)')}
          onMouseOut={e => !isResizingProperties && (e.currentTarget.style.backgroundColor = 'transparent')}
        />
        
        <PropertiesPanel width={propertiesWidth} />
      </div>
      
      {/* Resize Handle for Timeline */}
      <div 
        onMouseDown={() => {
          setIsResizingTimeline(true);
          document.body.style.cursor = 'ns-resize';
        }}
        style={{ 
          height: '4px', 
          cursor: 'ns-resize', 
          zIndex: 100,
          transition: 'background 0.2s',
          backgroundColor: isResizingTimeline ? 'var(--accent)' : 'transparent'
        }}
        onMouseOver={e => !isResizingTimeline && (e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.3)')}
        onMouseOut={e => !isResizingTimeline && (e.currentTarget.style.backgroundColor = 'transparent')}
      />
      
      <Timeline 
        height={timelineHeight} 
        trackHeaderWidth={trackHeaderWidth} 
        onStartResizingTrackHeader={() => {
          setIsResizingTrackHeader(true);
          document.body.style.cursor = 'ew-resize';
        }}
      />

      {isExporting && <ExportModal onClose={() => setIsExporting(false)} />}
      {isPreviewing && <PreviewModal onClose={() => setIsPreviewing(false)} />}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="h-screen w-screen bg-[#0f0f15] flex items-center justify-center text-white">Loading Editor...</div>}>
      <EditorContent />
    </Suspense>
  );
}
