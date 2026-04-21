import React, { useRef, useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import { Play, Pause, SkipBack, SkipForward, SplitSquareHorizontal, Copy, Trash2, ZoomIn, ZoomOut, Eye, EyeOff, Lock, Unlock, Layers, Volume2, VolumeX } from "lucide-react";

export default function Timeline({ 
  height = 300, 
  trackHeaderWidth = 100,
  onStartResizingTrackHeader
}: { 
  height?: number, 
  trackHeaderWidth?: number,
  onStartResizingTrackHeader?: () => void
}) {
  const { 
    layers, 
    duration, 
    currentTime, setCurrentTime, 
    isPlaying, setIsPlaying,
    zoom, setZoom,
    selectedLayerId, setSelectedLayerId,
    deleteLayer, splitLayer, duplicateLayer, updateLayer,
    tracks,
    addTrack,
    deleteTrack,
    reorderTracks,
    toggleTrackProperty,
    moveLayerTrack,
    updateTrack
  } = useStore();

  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Animation frame for playback
  const lastTimeRef = useRef(0);
  const reqRef = useRef(0);

  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      const loop = (time: number) => {
        const delta = (time - lastTimeRef.current) / 1000;
        lastTimeRef.current = time;
        setCurrentTime(useStore.getState().currentTime + delta);
        if (useStore.getState().currentTime >= duration) {
          setIsPlaying(false);
          setCurrentTime(0);
        }
        reqRef.current = requestAnimationFrame(loop);
      };
      reqRef.current = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(reqRef.current);
    }
    return () => cancelAnimationFrame(reqRef.current);
  }, [isPlaying, duration, setCurrentTime, setIsPlaying]);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
    // Account for the track header width
    const time = Math.max(0, (x - trackHeaderWidth)) / zoom;
    setCurrentTime(Math.max(0, Math.min(time, duration)));
  };

  // Drag state
  const [dragState, setDragState] = useState<{ 
    id: string, 
    type: 'move' | 'trimLeft' | 'trimRight', 
    startX: number, 
    startY: number,
    initialStartAt: number, 
    initialDuration: number, 
    initialTrimStart: number, 
    initialTotalDuration: number, 
    track: string 
  } | null>(null);

  const [activeVolumeTrackId, setActiveVolumeTrackId] = useState<string | null>(null);

  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDraggingPlayhead && timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
        const time = Math.max(0, (x - trackHeaderWidth)) / zoom;
        setCurrentTime(Math.max(0, Math.min(time, duration)));
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch(err) {}
      setIsDraggingPlayhead(false);
    };

    if (isDraggingPlayhead) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingPlayhead, zoom, trackHeaderWidth, duration, setCurrentTime]);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if ((e.target as Element).closest('.volume-popover-container')) {
         return;
      }
      setActiveVolumeTrackId(null);
    };
    if (activeVolumeTrackId) {
      document.addEventListener('mousedown', handleGlobalClick);
      return () => document.removeEventListener('mousedown', handleGlobalClick);
    }
  }, [activeVolumeTrackId]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState) return;
      const dx = (e.clientX - dragState.startX) / zoom;
      const layersState = useStore.getState().layers;
      const otherLayers = layersState.filter(l => l.track === dragState.track && l.id !== dragState.id);
      
      if (dragState.type === 'move') {
        let newStartAt = Math.max(0, dragState.initialStartAt + dx);
        
        const layersState = useStore.getState().layers;
        const tracksState = useStore.getState().tracks;
        
        // Calculate vertical track change
        let currentTrackId = dragState.track;
        if (timelineRef.current) {
          const rect = timelineRef.current.getBoundingClientRect();
          const relativeY = e.clientY - rect.top + timelineRef.current.scrollTop - 30; // 30 is ruler height
          const trackIndex = Math.floor(relativeY / 48); // 48 is track height
          if (trackIndex >= 0 && trackIndex < tracksState.length) {
            currentTrackId = tracksState[trackIndex].id;
          }
        }

        const checkTrackFit = (tId: string, testStartAt: number) => {
          const others = layersState.filter(l => l.track === tId && l.id !== dragState.id);
          for (const other of others) {
            if (testStartAt < other.startAt + other.duration && testStartAt + dragState.initialDuration > other.startAt) {
              return false;
            }
          }
          return true;
        };

        if (checkTrackFit(currentTrackId, newStartAt)) {
          updateLayer(dragState.id, { startAt: newStartAt, track: currentTrackId });
        } else if (checkTrackFit(dragState.track, newStartAt)) {
          // If the new track doesn't fit, try the original track with the same horizontal offset
          updateLayer(dragState.id, { startAt: newStartAt, track: dragState.track });
        } else {
          // Stay on current (clamped if needed)
           let maxPrevEnd = 0;
            let minNextStart = Infinity;
            const otherLayers = layersState.filter(l => l.track === dragState.track && l.id !== dragState.id);
            for (const other of otherLayers) {
              if (other.startAt + other.duration <= dragState.initialStartAt + 0.001) {
                if (other.startAt + other.duration > maxPrevEnd) maxPrevEnd = other.startAt + other.duration;
              }
              if (other.startAt >= dragState.initialStartAt + dragState.initialDuration - 0.001) {
                if (other.startAt < minNextStart) minNextStart = other.startAt;
              }
            }
            if (newStartAt < maxPrevEnd) newStartAt = maxPrevEnd;
            if (newStartAt + dragState.initialDuration > minNextStart) newStartAt = minNextStart - dragState.initialDuration;
            
            updateLayer(dragState.id, { startAt: newStartAt, track: dragState.track });
        }
      } else if (dragState.type === 'trimLeft') {
        const isMedia = (layersState.find(l => l.id === dragState.id)?.type === 'video' || layersState.find(l => l.id === dragState.id)?.type === 'audio');
        const maxDx = dragState.initialDuration - 0.1;
        let boundedDx = Math.min(maxDx, Math.max(-dragState.initialStartAt, isMedia ? -dragState.initialTrimStart : -Infinity, dx));
        
        let maxPrevEnd = 0;
        for (const other of otherLayers) {
          if (other.startAt + other.duration <= dragState.initialStartAt + 0.001) {
            if (other.startAt + other.duration > maxPrevEnd) maxPrevEnd = other.startAt + other.duration;
          }
        }
        
        let newStartAt = dragState.initialStartAt + boundedDx;
        if (newStartAt < maxPrevEnd) {
          boundedDx = maxPrevEnd - dragState.initialStartAt;
        }
        
        updateLayer(dragState.id, { 
          startAt: dragState.initialStartAt + boundedDx,
          duration: dragState.initialDuration - boundedDx,
          trimStart: dragState.initialTrimStart + boundedDx
        });
      } else if (dragState.type === 'trimRight') {
        const maxNewDuration = (dragState.initialTotalDuration || Infinity) - dragState.initialTrimStart;
        let newDuration = Math.max(0.1, Math.min(maxNewDuration, dragState.initialDuration + dx));
        
        let minNextStart = Infinity;
        for (const other of otherLayers) {
          if (other.startAt >= dragState.initialStartAt + dragState.initialDuration - 0.001) {
            if (other.startAt < minNextStart) minNextStart = other.startAt;
          }
        }
        
        if (dragState.initialStartAt + newDuration > minNextStart) {
          newDuration = minNextStart - dragState.initialStartAt;
        }
        
        updateLayer(dragState.id, { duration: newDuration });
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      handleMouseMove(e as any);
    };

    const handlePointerUp = (e: PointerEvent) => {
      (e.target as Element).releasePointerCapture(e.pointerId);
      setDragState(null);
    };

    if (dragState) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, zoom, updateLayer]);

  return (
    <div style={{ height: `${height}px`, backgroundColor: '#1a1a24', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Toolbar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button 
            onClick={() => addTrack()}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', backgroundColor: 'var(--bg-element)', borderRadius: '6px', fontSize: '13px', border: '1px solid var(--border)' }}
            title="Add New Track"
          >
            <Layers size={16} /> Add Track
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
          <button style={{ color: 'var(--text-main)' }} onClick={() => setCurrentTime(0)}><SkipBack size={18} /></button>
          <button 
            style={{ color: 'var(--text-main)', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          </button>
          <button style={{ color: 'var(--text-main)' }} onClick={() => setCurrentTime(duration)}><SkipForward size={18} /></button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: '14px', fontFamily: 'monospace', color: 'var(--accent)' }}>
            {new Date(currentTime * 1000).toISOString().substring(14, 22)}.{(currentTime % 1).toFixed(2).substring(2)}
          </div>

          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)', margin: '0 8px' }} />

          <button 
            disabled={!selectedLayerId}
            onClick={() => selectedLayerId && splitLayer(selectedLayerId, currentTime)}
            style={{ opacity: selectedLayerId ? 1 : 0.5, cursor: selectedLayerId ? 'pointer' : 'not-allowed' }}
            title="Split at Playhead"
          >
            <SplitSquareHorizontal size={18} />
          </button>
          <button 
            disabled={!selectedLayerId}
            onClick={() => selectedLayerId && duplicateLayer(selectedLayerId)}
            style={{ opacity: selectedLayerId ? 1 : 0.5, cursor: selectedLayerId ? 'pointer' : 'not-allowed' }}
            title="Copy"
          >
          <Copy size={18} />
          </button>
          <button 
            disabled={!selectedLayerId}
            onClick={() => selectedLayerId && deleteLayer(selectedLayerId)}
            style={{ opacity: selectedLayerId ? 1 : 0.5, cursor: selectedLayerId ? 'pointer' : 'not-allowed' }}
            title="Delete"
         >
            <Trash2 size={18} />
          </button>

          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)', margin: '0 8px' }} />

          <ZoomOut size={16} color="var(--text-muted)" onClick={() => setZoom(Math.max(5, zoom - 5))} style={{ cursor: 'pointer' }} />
          <input 
            type="range" min="5" max="200" value={zoom} onChange={e => setZoom(parseInt(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--accent)' }}
          />
          <ZoomIn size={16} color="var(--text-muted)" onClick={() => setZoom(Math.min(200, zoom + 5))} style={{ cursor: 'pointer' }}/>
        </div>
      </div>

      {/* Tracks Area */}
      <div 
        ref={timelineRef}
        style={{ flex: 1, overflow: 'auto', position: 'relative', cursor: dragState ? 'col-resize' : 'default' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedLayerId(null);
        }}
      >
        <div style={{ minWidth: `calc(${trackHeaderWidth}px + ${duration * zoom}px)`, height: '100%', minHeight: '100%' }}>
          {/* Ruler */}
          <div style={{ display: 'flex', height: '30px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, backgroundColor: '#14141d', zIndex: 10 }} onClick={handleTimelineClick}>
            <div style={{ position: 'sticky', left: 0, width: `${trackHeaderWidth}px`, backgroundColor: '#14141d', zIndex: 15, borderRight: '1px solid var(--border)' }} />
            <div style={{ position: 'relative', flex: 1 }}>
              {(() => {
                // Calculate dynamic interval based on zoom
                // We want labels to be at least ~80px apart
                const minLabelSpacing = 80;
                const idealInterval = minLabelSpacing / zoom;
                
                // Snap to sensible intervals: 0.1, 0.5, 1, 2, 5, 10, 30, 60
                const intervals = [0.1, 0.5, 1, 2, 5, 10, 30, 60];
                const interval = intervals.reduce((prev, curr) => 
                  Math.abs(curr - idealInterval) < Math.abs(prev - idealInterval) ? curr : prev
                );

                const markers = [];
                for (let t = 0; t <= duration; t += interval) {
                  const formatTime = (seconds: number) => {
                    const mins = Math.floor(seconds / 60);
                    const secs = Math.floor(seconds % 60);
                    const ms = Math.floor((seconds % 1) * 10);
                    if (interval < 1) {
                      return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`;
                    }
                    return `${mins}:${secs.toString().padStart(2, '0')}`;
                  };

                  markers.push(
                    <div key={t} style={{ position: 'absolute', left: `${t * zoom}px`, height: '10px', bottom: 0, borderLeft: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '10px', marginLeft: '4px', color: 'var(--text-muted)', userSelect: 'none', position: 'relative', top: '-18px', whiteSpace: 'nowrap' }}>
                        {formatTime(t)}
                      </span>
                    </div>
                  );
                }
                return markers;
              })()}
            </div>
          </div>

          {/* Tracks */}
          {tracks.map((track, trackIndex) => (
            <div 
              key={track.id} 
              style={{ 
                display: 'flex', 
                height: '48px', 
                borderBottom: '1px solid var(--border)', 
                position: 'relative', 
                boxSizing: 'border-box', 
                opacity: track.isVisible ? 1 : 0.5,
                zIndex: activeVolumeTrackId === track.id ? 50 : 1
              }} 
              onClick={handleTimelineClick}
            >
              <div 
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('trackIndex', trackIndex.toString());
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const fromIndex = parseInt(e.dataTransfer.getData('trackIndex'));
                  if (!isNaN(fromIndex)) reorderTracks(fromIndex, trackIndex);
                }}
                style={{ 
                  position: 'sticky', 
                  left: 0, 
                  width: `${trackHeaderWidth}px`, 
                  backgroundColor: '#1a1a24', 
                  zIndex: 5, 
                  padding: '0 10px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  fontSize: '11px', 
                  color: 'var(--text-muted)', 
                  borderRight: '1px solid var(--border)', 
                  userSelect: 'none',
                  cursor: 'grab'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', paddingRight: '8px' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>{track.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                  <div className="volume-popover-container" style={{ position: 'relative' }}>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setActiveVolumeTrackId(activeVolumeTrackId === track.id ? null : track.id); 
                      }}
                      style={{ background: 'none', border: 'none', color: track.isMuted || track.volume === 0 ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                      title="Adjust Volume"
                    >
                      {track.isMuted || track.volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    </button>
                    {activeVolumeTrackId === track.id && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{ 
                          position: 'absolute', 
                          top: '100%', 
                          left: '50%', 
                          transform: 'translateX(-50%)', 
                          marginTop: '8px',
                          backgroundColor: 'var(--bg-panel)', 
                          padding: '16px', 
                          borderRadius: '8px', 
                          zIndex: 100, 
                          border: '1px solid var(--border)', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '16px', 
                          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                          width: '160px'
                        }}
                      >
                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 500 }}>Mute Track</span>
                            <div 
                              onClick={() => updateTrack(track.id, { isMuted: !track.isMuted })}
                              style={{ 
                                width: '32px', height: '18px', borderRadius: '10px', 
                                backgroundColor: track.isMuted ? 'var(--accent)' : 'var(--bg-dark)', 
                                border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative',
                                display: 'flex', alignItems: 'center', padding: '0 2px',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{ 
                                width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'white',
                                transform: track.isMuted ? 'translateX(14px)' : 'translateX(0)',
                                transition: 'all 0.2s'
                              }} />
                            </div>
                         </div>
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Volume</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-main)' }}>{Math.round((track.volume ?? 1) * 100)}%</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Volume2 size={14} color="var(--text-muted)" />
                              <input 
                                type="range" 
                                min="0" max="1" step="0.05" 
                                value={track.volume ?? 1} 
                                onChange={e => { 
                                  const v = parseFloat(e.target.value);
                                  updateTrack(track.id, { volume: v }); 
                                  if (track.isMuted && v > 0) updateTrack(track.id, { isMuted: false }); 
                                }} 
                                style={{ flex: 1, height: '4px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                              />
                            </div>
                         </div>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleTrackProperty(track.id, 'isVisible'); }}
                    style={{ background: 'none', border: 'none', color: track.isVisible ? 'var(--text-muted)' : 'var(--accent)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                  >
                    {track.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleTrackProperty(track.id, 'isLocked'); }}
                    style={{ background: 'none', border: 'none', color: track.isLocked ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                  >
                    {track.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (window.confirm(`Delete track "${track.name}" and all its clips?`)) {
                        deleteTrack(track.id);
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}
                    title="Delete Track"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Resize Handle for Track Header */}
                <div 
                  onMouseDown={(e) => { e.stopPropagation(); onStartResizingTrackHeader?.(); }}
                  style={{ position: 'absolute', right: -2, top: 0, bottom: 0, width: '4px', cursor: 'ew-resize', zIndex: 20 }} 
                />
              </div>
              
              {/* Items Area (Drop Target for moving clips between tracks) */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const dataStr = e.dataTransfer.getData('application/json');
                  if (!dataStr) {
                    // Fallback for simple layerId drops (moving clips)
                    const layerId = e.dataTransfer.getData('layerId');
                    if (layerId) {
                      const layer = layers.find(l => l.id === layerId);
                      if (layer) {
                        const checkTrackFit = (tId: string) => {
                          const otherLayers = layers.filter((l: any) => l.track === tId && l.id !== layer.id);
                          for (const other of otherLayers) {
                            if (layer.startAt < other.startAt + other.duration && layer.startAt + layer.duration > other.startAt) {
                              return false;
                            }
                          }
                          return true;
                        };

                        if (checkTrackFit(track.id)) {
                          moveLayerTrack(layerId, track.id);
                        } else {
                          let targetId = null;
                          for (const t of tracks) {
                            if (t.id !== track.id && checkTrackFit(t.id)) {
                              targetId = t.id;
                              break;
                            }
                          }
                          if (targetId) {
                            moveLayerTrack(layerId, targetId);
                          } else {
                            const newTrackId = addTrack();
                            moveLayerTrack(layerId, newTrackId);
                          }
                        }
                      }
                    }
                    return;
                  };

                  try {
                    const data = JSON.parse(dataStr);
                    if (data.type === 'applyTransition') {
                      // We need to know which clip we dropped onto. 
                      // This onDrop is on the TRACK, not the CLIP.
                      // To drop onto a clip, we need the CLIP's onDrop.
                    }
                  } catch (err) {}
                }}
                style={{ position: 'relative', flex: 1 }}
              >
                {layers.filter(l => l.track === track.id).map(layer => (
                  <div
                    key={layer.id}
                    onPointerDown={(e) => { 
                      if (track.isLocked) return;
                      e.stopPropagation(); 
                      e.currentTarget.setPointerCapture(e.pointerId);
                      setSelectedLayerId(layer.id);
                      setDragState({ id: layer.id, type: 'move', startX: e.clientX, startY: e.clientY, initialStartAt: layer.startAt, initialDuration: layer.duration, initialTrimStart: layer.trimStart, initialTotalDuration: layer.totalDuration, track: layer.track });
                    }}
                    style={{
                      position: 'absolute',
                      left: `${layer.startAt * zoom}px`,
                      width: `${layer.duration * zoom}px`,
                      height: '36px',
                      top: '5px',
                      backgroundColor: layer.id === selectedLayerId ? 'var(--accent)' : 'rgba(139, 92, 246, 0.4)',
                      border: layer.id === selectedLayerId ? '1px solid white' : '1px solid transparent',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 10px',
                      fontSize: '11px',
                      color: 'white',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      cursor: track.isLocked ? 'not-allowed' : 'grab',
                      userSelect: 'none',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                      zIndex: layer.id === selectedLayerId ? 30 : 25
                    }}
                    onDragOver={(e) => {
                      if (e.dataTransfer.types.includes('application/json')) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    } }
                    onDrop={(e) => {
                      const dataStr = e.dataTransfer.getData('application/json');
                      if (!dataStr) return;
                      e.stopPropagation();
                      try {
                        const data = JSON.parse(dataStr);
                        if (data.type === 'applyTransition') {
                          const { type, category } = data.payload;
                          const newTransitions = { ...layer.transitions };
                          if (category === 'in') {
                            newTransitions.in = { type, duration: 1 };
                          } else {
                            newTransitions.out = { type, duration: 1 };
                          }
                          updateLayer(layer.id, { transitions: newTransitions });
                        }
                      } catch (err) {}
                    }}
                  >
                    <span style={{ marginRight: '6px', zIndex: 10 }}>{layer.type === 'video' ? '🎬' : layer.type === 'text' ? 'T' : 'O'}</span>
                    <span style={{ zIndex: 10 }}>{layer.name}</span>

                    {/* In Transition Visualizer */}
                    {layer.transitions?.in?.type && layer.transitions.in.type !== 'none' && (
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(layer.transitions.in.duration || 1) * zoom}px`, backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.3), rgba(255,255,255,0))', pointerEvents: 'none', borderLeft: '3px solid rgba(156, 235, 9, 0.94)' }} title={`In Transition: ${layer.transitions.in.type}`} />
                    )}
                    {/* Out Transition Visualizer */}
                    {layer.transitions?.out?.type && layer.transitions.out.type !== 'none' && (
                      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: `${(layer.transitions.out.duration || 1) * zoom}px`, backgroundImage: 'linear-gradient(to left, rgba(255,255,255,0.3), rgba(255,255,255,0))', pointerEvents: 'none', borderRight: '3px solid rgba(156, 235, 9, 0.94)' }} title={`Out Transition: ${layer.transitions.out.type}`} />
                    )}

                    {/* Left Trim Handle */}
                    <div 
                      onPointerDown={(e) => {
                        if (track.isLocked) return;
                        e.stopPropagation();
                        e.currentTarget.setPointerCapture(e.pointerId);
                        setSelectedLayerId(layer.id);
                        setDragState({ id: layer.id, type: 'trimLeft', startX: e.clientX, startY: e.clientY, initialStartAt: layer.startAt, initialDuration: layer.duration, initialTrimStart: layer.trimStart, initialTotalDuration: layer.totalDuration, track: layer.track });
                      }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.4)'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                      style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '10px', cursor: track.isLocked ? 'not-allowed' : 'ew-resize', backgroundColor: 'rgba(255,255,255,0.1)', transition: 'background-color 0.2s', zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                    >
                      <div style={{ width: '2px', height: '12px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '1px' }} />
                    </div>
                    {/* Right Trim Handle */}
                    <div 
                      onPointerDown={(e) => {
                        if (track.isLocked) return;
                        e.stopPropagation();
                        e.currentTarget.setPointerCapture(e.pointerId);
                        setSelectedLayerId(layer.id);
                        setDragState({ id: layer.id, type: 'trimRight', startX: e.clientX, startY: e.clientY, initialStartAt: layer.startAt, initialDuration: layer.duration, initialTrimStart: layer.trimStart, initialTotalDuration: layer.totalDuration, track: layer.track });
                      }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.4)'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                      style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '10px', cursor: track.isLocked ? 'not-allowed' : 'ew-resize', backgroundColor: 'rgba(255,255,255,0.1)', transition: 'background-color 0.2s', zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                    >
                      <div style={{ width: '2px', height: '12px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '1px' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Playhead */}
          <div style={{
            position: 'absolute',
            left: `${trackHeaderWidth + currentTime * zoom}px`,
            top: 0,
            bottom: 0,
            width: '1px',
            backgroundColor: '#ef4444', // Red playhead
            pointerEvents: 'none',
            zIndex: 20
          }}>
            <div 
              onPointerDown={(e) => {
                e.stopPropagation();
                e.currentTarget.setPointerCapture(e.pointerId);
                setIsDraggingPlayhead(true);
              }}
              style={{
                pointerEvents: 'auto',
                cursor: 'grab',
                position: 'absolute',
                top: 0,
                left: '-10px',
                width: '20px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div style={{ width: '13px', height: '13px', backgroundColor: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '3px', height: '3px', backgroundColor: 'white', borderRadius: '50%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
