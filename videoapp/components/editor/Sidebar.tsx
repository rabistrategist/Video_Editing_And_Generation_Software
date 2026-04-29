import React, { useState, useRef } from "react";
import { Video, Type, Shapes, Layers, Wand2, Library as LibraryIcon, Music } from "lucide-react";
import { useStore } from "../../store/useStore";

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState("media");
  const [libraryTab, setLibraryTab] = useState("video");
  const addLayer = useStore(state => state.addLayer);
  const currentTime = useStore(state => state.currentTime);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localAssets, setLocalAssets] = useState<{ id: string, name: string, type: 'video'|'audio'|'image', url: string }[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const type = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : 'video';
      const url = URL.createObjectURL(file);
      
      const assetId = Math.random().toString();
      // Add immediately for UI responsiveness
      setLocalAssets(prev => [...prev, { id: assetId, name: file.name, type, url, serverPath: '' }]);
      
      // Upload to server for FFmpeg
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          setLocalAssets(prev => prev.map(a => a.id === assetId ? { ...a, serverPath: data.path } : a));
        }
      } catch (err) {
        console.error("Sync failed:", err);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, payload: any) => {
    const data = JSON.stringify({ type: 'addLayer', payload });
    e.dataTransfer.setData('application/x-editor-layer', data);
    e.dataTransfer.setData('text/plain', data);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const tabs = [
    { id: "media", icon: <Video size={20} />, label: "Media" },
    { id: "library", icon: <LibraryIcon size={20} />, label: "Library" },
    { id: "text", icon: <Type size={20} />, label: "Text" },
    { id: "elements", icon: <Shapes size={20} />, label: "Elements" },
    { id: "transitions", icon: <Wand2 size={20} />, label: "Transitions" },
  ];

  return (
    <div style={{ display: 'flex', width: '300px', backgroundColor: 'var(--bg-panel)', borderRight: '1px solid var(--border)' }}>
      {/* Tab Strip */}
      <div style={{ width: '60px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              width: '40px',
              height: '40px',
              marginBottom: '10px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
              backgroundColor: activeTab === tab.id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
            }}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        
        {activeTab === "media" && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px' }}>MEDIA</h3>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="video/*,image/*,audio/*"
              onChange={handleFileUpload}
            />

            <div style={{
              border: '2px dashed var(--border)',
              borderRadius: '8px',
              padding: '24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
            onClick={() => fileInputRef.current?.click()}
            >
              Drop files or click to upload
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Video, Audio, Image</div>
            </div>
            {/* Mock Asset List */}
            <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>Local Assets</h4>
            {localAssets.map((asset: any) => {
              const payload = { type: asset.type as any, name: asset.name, startAt: currentTime, duration: 10, totalDuration: 10, isVisible: true, isLocked: false, url: asset.url, serverPath: asset.serverPath, transform: { x: 300, y: 300, width: 400, height: 225, rotation: 0, opacity: 1, speed: 1, flipX: false, flipY: false }, trimStart: 0 };
              return (
              <div 
                key={asset.id}
                draggable
                onDragStart={(e) => handleDragStart(e, payload)}
                onClick={() => addLayer(payload)}
                style={{ display: 'flex', gap: '10px', padding: '8px', borderRadius: '6px', cursor: 'grab', marginBottom: '8px' } }
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-element)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{ padding: '10px', backgroundColor: '#333', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {asset.type === 'video' ? <Video size={16} color="var(--text-muted)" /> : <Shapes size={16} color="var(--text-muted)" />}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{asset.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{asset.type}</div>
                </div>
              </div>
            )})}
          </div>
        )}

        {activeTab === "text" && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px' }}>TEXT</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { name: 'Heading', size: 48, weight: 700 },
                { name: 'Subheading', size: 32, weight: 600 },
                { name: 'Body', size: 20, weight: 400 },
                { name: 'Caption', size: 14, weight: 400 },
              ].map((preset) => {
                const payload = { type: 'text' as const, name: preset.name, content: `Add a ${preset.name}`, font: 'Inter', fontSize: preset.size, startAt: currentTime, duration: 5, isVisible: true, isLocked: false, transform: { x: 960, y: 540, width: 600, height: 100, rotation: 0, opacity: 1, speed: 1, flipX: false, flipY: false } };
                return (
                <button
                  key={preset.name}
                  draggable
                  onDragStart={(e) => handleDragStart(e, payload)}
                  onClick={() => addLayer(payload)}
                  style={{
                    padding: '16px',
                    backgroundColor: 'var(--bg-element)',
                    borderRadius: '8px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'grab'
                  }}
                >
                   <Type size={20} color="var(--text-muted)" />
                   <div>
                     <div style={{ fontSize: '16px', fontWeight: preset.weight }}>{preset.name}</div>
                     <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{preset.size}px • {preset.weight}</div>
                   </div>
                </button>
              )})}
            </div>
            <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)', padding: '12px', backgroundColor: 'var(--bg-element)', borderRadius: '6px' }}>
              Double-click a text layer on the canvas to edit its content and style.<br/>
              Drag items to canvas to place them exactly where you want.
            </div>
          </div>
        )}

        {activeTab === "elements" && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px' }}>SHAPES</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {['Rectangle', 'Circle', 'Triangle', 'Star'].map((shape) => {
                const payload = { type: 'shape' as const, name: shape, content: shape.toLowerCase(), startAt: currentTime, duration: 5, isVisible: true, color: '#8b5cf6', isLocked: false, transform: { x: 960, y: 540, width: 200, height: 200, rotation: 0, opacity: 1, speed: 1, flipX: false, flipY: false } };
                return (
                <button 
                  key={shape} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, payload)}
                  onClick={() => addLayer(payload)}
                  style={{ padding: '16px', backgroundColor: 'var(--bg-element)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'grab', transition: 'transform 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {shape === 'Rectangle' && <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--accent)', borderRadius: '4px' }} />}
                    {shape === 'Circle' && <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--accent)', borderRadius: '50%' }} />}
                    {shape === 'Triangle' && (
                      <svg width="34" height="34" viewBox="0 0 100 100">
                        <polygon points="50,5 95,95 5,95" fill="var(--accent)" />
                      </svg>
                    )}
                    {shape === 'Star' && (
                      <svg width="36" height="36" viewBox="0 0 100 100">
                        <polygon points="50,5 63,38 98,38 70,59 81,95 50,75 19,95 30,59 2,38 37,38" fill="var(--accent)" />
                      </svg>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-main)' }}>{shape}</div>
                </button>
              )})}
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', margin: '24px 0 16px 0' }}>EMOJIS</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['😀','🎉','🔥','⭐️','💡','🎵','🌟','❤️','🎬','📺','🎤','🎨','🚀','💎','💯','🎯','⚡️','💻','📸','🕹️'].map((emoji) => {
                const payload = { type: 'emoji' as const, name: `Emoji ${emoji}`, content: emoji, fontSize: 80, startAt: currentTime, duration: 5, isVisible: true, isLocked: false, transform: { x: 960, y: 540, width: 80, height: 80, rotation: 0, opacity: 1, speed: 1, flipX: false, flipY: false } };
                return (
                <button 
                  key={emoji}
                  draggable
                  onDragStart={(e) => handleDragStart(e, payload)}
                  onClick={() => addLayer(payload)}
                  style={{ fontSize: '24px', padding: '8px', backgroundColor: 'var(--bg-element)', borderRadius: '6px', cursor: 'grab' }}
                >
                  {emoji}
                </button>
              )})}
            </div>
          </div>
        )}

        {activeTab === "transitions" && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px' }}>TRANSITIONS</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { name: 'Fade In', type: 'fade', category: 'in' },
                { name: 'Fade Out', type: 'fade', category: 'out' },
                { name: 'Slide Right (In)', type: 'slideRight', category: 'in' },
                { name: 'Slide Left (In)', type: 'slideLeft', category: 'in' },
                { name: 'Slide Right (Out)', type: 'slideRight', category: 'out' },
                { name: 'Slide Left (Out)', type: 'slideLeft', category: 'out' },
                { name: 'Zoom In', type: 'zoomIn', category: 'in' },
                { name: 'Zoom Out', type: 'zoomOut', category: 'out' },
              ].map((trans) => {
                const isSelected = useStore.getState().selectedLayerId;
                const updateLayer = useStore.getState().updateLayer;
                const layers = useStore.getState().layers;
                const selectedLayer = layers.find(l => l.id === isSelected);

                return (
                <button
                  key={trans.name}
                  disabled={!isSelected}
                  onClick={() => {
                    if (isSelected && selectedLayer) {
                      const newTransitions = { ...selectedLayer.transitions };
                      if (trans.category === 'in') {
                        newTransitions.in = { type: trans.type, duration: 1 };
                      } else {
                        newTransitions.out = { type: trans.type, duration: 1 };
                      }
                      updateLayer(isSelected, { transitions: newTransitions });
                    }
                  }}
                  draggable
                  onDragStart={(e) => {
                    const data = JSON.stringify({ 
                      type: 'applyTransition', 
                      payload: { type: trans.type, category: trans.category } 
                    });
                    e.dataTransfer.setData('application/x-editor-layer', data);
                    e.dataTransfer.setData('text/plain', data);
                  }}
                  style={{ 
                    padding: '16px 12px', 
                    backgroundColor: 'var(--bg-element)', 
                    borderRadius: '8px', 
                    fontSize: '11px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: isSelected ? 1 : 0.5,
                    cursor: isSelected ? 'pointer' : 'not-allowed',
                    border: '1px solid transparent'
                  }}
                  onMouseOver={e => isSelected && (e.currentTarget.style.borderColor = 'var(--accent)')}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <Wand2 size={20} color="var(--accent)" />
                  <div style={{ textAlign: 'center' }}>{trans.name}</div>
                </button>
              )})}
            </div>
          </div>
        )}

        {activeTab === "library" && (
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '16px' }}>STOCK LIBRARY</h3>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
               <button onClick={() => setLibraryTab('video')} style={{ flex: 1, padding: '8px', fontSize: '12px', borderRadius: '6px', backgroundColor: libraryTab === 'video' ? 'var(--accent)' : 'var(--bg-element)', color: 'white' }}>Video</button>
               <button onClick={() => setLibraryTab('audio')} style={{ flex: 1, padding: '8px', fontSize: '12px', borderRadius: '6px', backgroundColor: libraryTab === 'audio' ? 'var(--accent)' : 'var(--bg-element)', color: 'white' }}>Audio</button>
            </div>

            {libraryTab === 'video' && (
              <div>
                {[
                  { name: 'Nature Pan.mp4', url: '/mov_bbb.mp4', dur: '0:10' },
                  { name: '4K Nature.mp4', url: '/14796667_3840_2160_25fps.mp4', dur: '0:30' },
                  { name: 'Output.mp4', url: '/output.mp4', dur: '0:05' }
                ].map((stock) => {
                  const payload = { type: 'video' as const, name: stock.name, startAt: currentTime, duration: 10, totalDuration: 10, isVisible: true, isLocked: false, url: stock.url, transform: { x: 300, y: 300, width: 400, height: 225, rotation: 0, opacity: 1, speed: 1, flipX: false, flipY: false }, trimStart: 0 };
                  return (
                <div 
                  key={stock.url}
                  draggable
                  onDragStart={(e) => handleDragStart(e, payload)}
                  onClick={() => addLayer(payload)}
                  style={{ display: 'flex', gap: '10px', padding: '8px', borderRadius: '6px', cursor: 'grab', marginBottom: '10px' } }
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-element)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  
                  <div style={{ width: '60px', height: '40px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Video size={20} color="var(--text-muted)" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '13px' }}>{stock.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{stock.dur} • Stock Video</div>
                  </div>
                </div>
                )})}
              </div>              
            )}

            {libraryTab === 'audio' && (
              <div>
                {[
                  { name: 'Horse.mp3', url: '/horse.mp3', dur: '0:03' },
                  { name: 'Summer Insects.mp3', url: '/soul_serenity_sounds-summer-insects-243572 (1).mp3', dur: '2:15' },
                  { name: 'Fun Stinger.mp3', url: '/openmindaudio-fun-stinger-playful-short-audio-cue-469098.mp3', dur: '0:05' },
                  { name: 'South Melody.mp3', url: '/23 Theme - SouthMelody.mp3', dur: '1:20' }
                ].map((stock) => {
                  const payload = { type: 'audio' as const, name: stock.name, startAt: currentTime, duration: 5, totalDuration: 5, isVisible: true, isLocked: false, url: stock.url, transform: { x: 0, y: 0, width: 0, height: 0, rotation: 0, opacity: 1, speed: 1, flipX: false, flipY: false }, trimStart: 0 };
                  return (
                <div 
                  key={stock.url}
                  draggable
                  onDragStart={(e) => handleDragStart(e, payload)}
                  onClick={() => addLayer(payload)}
                  style={{ display: 'flex', gap: '10px', padding: '8px', borderRadius: '6px', cursor: 'grab', marginBottom: '10px' } }
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-element)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ width: '60px', height: '40px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Music size={20} color="var(--text-muted)" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: '13px' }}>{stock.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{stock.dur} • Stock Audio</div>
                  </div>
                </div>
                )})}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
