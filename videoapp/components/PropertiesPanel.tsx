import React from "react";
import { useStore } from "../store/useStore";
import { Settings2, RotateCcw, GaugeIcon, BlendIcon } from "lucide-react";

const aspectRatios = [
  { label: '16:9', width: 1920, height: 1080 },
  { label: '9:16', width: 1080, height: 1920 },
  { label: '1:1', width: 1080, height: 1080 },
  { label: '4:3', width: 1440, height: 1080 },
  { label: '21:9', width: 2520, height: 1080 },
];

const ACCENT = "var(--accent)";
const INPUT_BG = "var(--bg-dark)";
const PANEL_BG = "var(--bg-panel)";
const TEXT_MUTED = "var(--text-muted)";
const BORDER = "var(--border)";

export default function PropertiesPanel({ width = 300 }: { width?: number }) {
  const { selectedLayerId, layers, canvas, updateLayer, setCanvasSettings } = useStore();

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  return (
    <div style={{ width: `${width}px`, backgroundColor: PANEL_BG, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', color: 'white' }}>
      <div style={{ padding: '20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* CANVAS SETTINGS SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT_MUTED, letterSpacing: '0.05em' }}>CANVAS SETTINGS</div>

          {/* Aspect Ratio Buttons */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {aspectRatios.map(ratio => {
              const isActive = canvas.width === ratio.width && canvas.height === ratio.height;
              return (
                <button
                  key={ratio.label}
                  onClick={() => setCanvasSettings({ width: ratio.width, height: ratio.height, aspectRatio: ratio.label })}
                  style={{
                    padding: '8px 10px',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? ACCENT : BORDER}`,
                    borderRadius: '6px',
                    color: isActive ? ACCENT : TEXT_MUTED,
                    fontSize: '12px',
                    cursor: 'pointer',
                    minWidth: '40px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {ratio.label}
                </button>
              );
            })}
          </div>

          {/* Width Input */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <label style={{ fontSize: '13px', color: TEXT_MUTED, width: '60px' }}>Width</label>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="number"
                value={canvas.width}
                onChange={e => setCanvasSettings({ width: parseFloat(e.target.value) || 1920 })}
                style={{ width: '100%', padding: '10px 32px 10px 12px', backgroundColor: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: '6px', color: 'white', fontSize: '14px' }}
              />
              <span style={{ position: 'absolute', right: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>px</span>
            </div>
          </div>

          {/* Height Input */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <label style={{ fontSize: '13px', color: TEXT_MUTED, width: '60px' }}>Height</label>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="number"
                value={canvas.height}
                onChange={e => setCanvasSettings({ height: parseFloat(e.target.value) || 1080 })}
                style={{ width: '100%', padding: '10px 32px 10px 12px', backgroundColor: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: '6px', color: 'white', fontSize: '14px' }}
              />
              <span style={{ position: 'absolute', right: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>px</span>
            </div>
          </div>

          {/* BG Color Picker */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <label style={{ fontSize: '13px', color: TEXT_MUTED, width: '60px' }}>BG Color</label>
            <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
              <div style={{
                width: '40px', height: '24px',
                backgroundColor: canvas.backgroundColor,
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <input
                  type="color"
                  value={canvas.backgroundColor}
                  onChange={e => setCanvasSettings({ backgroundColor: e.target.value })}
                  style={{ position: 'absolute', opacity: 0, top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                />
              </div>
              <input
                type="text"
                value={canvas.backgroundColor}
                onChange={e => setCanvasSettings({ backgroundColor: e.target.value })}
                style={{ flex: 1, padding: '8px', width: '0px', backgroundColor: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: '6px', color: 'white', fontSize: '12px', textTransform: 'uppercase' }}
              />
            </div>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />

        {/* LAYER TRANSFORM SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: TEXT_MUTED, letterSpacing: '0.05em' }}>LAYER TRANSFORM</div>

          {!selectedLayer ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px', textAlign: 'center' }}>
              Select a layer to transform
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: TEXT_MUTED, marginBottom: '8px', display: 'block' }}>Name</label>
                <input
                  type="text"
                  value={selectedLayer.name}
                  onChange={e => updateLayer(selectedLayer.id, { name: e.target.value })}
                  style={{ width: '100%', padding: '10px', backgroundColor: INPUT_BG, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                />
              </div>

              {selectedLayer.type === 'text' && (
                <div>
                  <label style={{ fontSize: '12px', color: TEXT_MUTED, marginBottom: '8px', display: 'block' }}>Text Content</label>
                  <textarea
                    value={selectedLayer.content || ""}
                    onChange={e => updateLayer(selectedLayer.id, { content: e.target.value })}
                    style={{ width: '100%', minHeight: '80px', padding: '10px', backgroundColor: INPUT_BG, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: 'white', fontSize: '14px', resize: 'vertical' }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: TEXT_MUTED, marginBottom: '8px', display: 'block' }}>Start Time (s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedLayer.startAt.toFixed(1)}
                    onChange={e => updateLayer(selectedLayer.id, { startAt: parseFloat(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '10px', backgroundColor: INPUT_BG, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: TEXT_MUTED, marginBottom: '8px', display: 'block' }}>Duration (s)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={selectedLayer.duration.toFixed(1)}
                    onChange={e => updateLayer(selectedLayer.id, { duration: parseFloat(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '10px', backgroundColor: INPUT_BG, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: TEXT_MUTED }}>X</span>
                  <input
                    type="number"
                    value={selectedLayer.transform.x.toFixed(1)}
                    onChange={e => updateLayer(selectedLayer.id, { transform: { ...selectedLayer.transform, x: parseFloat(e.target.value) || 0 } })}
                    style={{ width: '100%', padding: '8px', backgroundColor: INPUT_BG, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: TEXT_MUTED }}>Y</span>
                  <input
                    type="number"
                    value={selectedLayer.transform.y.toFixed(1)}
                    onChange={e => updateLayer(selectedLayer.id, { transform: { ...selectedLayer.transform, y: parseFloat(e.target.value) || 0 } })}
                    style={{ width: '100%', padding: '8px', backgroundColor: INPUT_BG, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: TEXT_MUTED }}>W</span>
                  <input
                    type="number"
                    value={selectedLayer.transform.width.toFixed(1)}
                    onChange={e => updateLayer(selectedLayer.id, { transform: { ...selectedLayer.transform, width: parseFloat(e.target.value) || 10 } })}
                    style={{ width: '100%', padding: '8px', backgroundColor: INPUT_BG, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: TEXT_MUTED }}>H</span>
                  <input
                    type="number"
                    value={selectedLayer.transform.height.toFixed(1)}
                    onChange={e => updateLayer(selectedLayer.id, { transform: { ...selectedLayer.transform, height: parseFloat(e.target.value) || 10 } })}
                    style={{ width: '100%', padding: '8px', backgroundColor: INPUT_BG, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                  />
                </div>
              </div>

              {/* Opacity Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: TEXT_MUTED }}>Opacity <BlendIcon style={{ width: '16px', height: '16px' }} /></label>
                  <span style={{ fontSize: '12px', color: 'white' }}>{Math.round(selectedLayer.transform.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0" max="1" step="0.05"
                  value={selectedLayer.transform.opacity}
                  onChange={e => updateLayer(selectedLayer.id, { transform: { ...selectedLayer.transform, opacity: parseFloat(e.target.value) } })}
                  style={{ width: '100%', accentColor: ACCENT }}
                />
              </div>

              {/* Color Selection (for Text, Shapes, Emojis) */}
              {(selectedLayer.type === 'text' || selectedLayer.type === 'shape' || selectedLayer.type === 'emoji') && (
                <div>
                  <label style={{ fontSize: '12px', color: TEXT_MUTED, marginBottom: '8px', display: 'block' }}>Color</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      backgroundColor: selectedLayer.color || '#ffffff',
                      border: '1px solid rgba(255,255,255,0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="color"
                        value={selectedLayer.color || '#ffffff'}
                        onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                        style={{
                          position: 'absolute',
                          top: '-50%',
                          left: '-50%',
                          width: '200%',
                          height: '200%',
                          cursor: 'pointer',
                          opacity: 0
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      value={selectedLayer.color || '#ffffff'}
                      onChange={(e) => updateLayer(selectedLayer.id, { color: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: INPUT_BG,
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Text Specific (Font size & Font family) */}
              {selectedLayer.type === 'text' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: TEXT_MUTED, marginBottom: '8px', display: 'block' }}>Font Size</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="range"
                        min="10" max="300" step="1"
                        value={selectedLayer.fontSize || 32}
                        onChange={e => updateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) })}
                        style={{ flex: 1, accentColor: ACCENT }}
                      />
                      <input
                        type="number"
                        value={selectedLayer.fontSize || 32}
                        onChange={e => updateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) || 10 })}
                        style={{ width: '60px', padding: '8px', backgroundColor: INPUT_BG, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: TEXT_MUTED, marginBottom: '8px', display: 'block' }}>Font Family</label>
                    <select
                      value={selectedLayer.font || "Inter"}
                      onChange={e => updateLayer(selectedLayer.id, { font: e.target.value })}
                      style={{ width: '100%', padding: '10px', backgroundColor: INPUT_BG, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                    >
                      <option value="Inter">Inter (Default)</option>
                      <option value="Arial">Arial</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Montserrat">Montserrat</option>
                      <option value="Playfair Display">Playfair Display (Serif)</option>
                      <option value="Courier New">Courier New (Mono)</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      <option value="system-ui">System UI</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: TEXT_MUTED, marginBottom: '8px', display: 'block' }}>Alignment</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <select
                        value={selectedLayer.align || "center"}
                        onChange={e => updateLayer(selectedLayer.id, { align: e.target.value })}
                        style={{ width: '100%', padding: '8px', backgroundColor: INPUT_BG, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: 'white', fontSize: '12px' }}
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                      <select
                        value={selectedLayer.verticalAlign || "middle"}
                        onChange={e => updateLayer(selectedLayer.id, { verticalAlign: e.target.value })}
                        style={{ width: '100%', padding: '8px', backgroundColor: INPUT_BG, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: 'white', fontSize: '12px' }}
                      >
                        <option value="top">Top</option>
                        <option value="middle">Middle</option>
                        <option value="bottom">Bottom</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Speed Slider */}
              {(selectedLayer.type === 'video' || selectedLayer.type === 'audio') && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: TEXT_MUTED }}>Speed<GaugeIcon style={{ width: '16px', height: '16px' }} /></label>
                    <span style={{ fontSize: '12px', color: 'white' }}>{selectedLayer.transform.speed?.toFixed(2) || '1.00'}x</span>
                  </div> 
                  
                  <input
                    type="range"
                    min="0.1" max="5" step="0.1"
                    value={selectedLayer.transform.speed || 1}
                    onChange={e => {
                      const newSpeed = parseFloat(e.target.value);
                      const oldSpeed = selectedLayer.transform.speed || 1;
                      const newDuration = selectedLayer.duration * (oldSpeed / newSpeed);
                      updateLayer(selectedLayer.id, { 
                        transform: { ...selectedLayer.transform, speed: newSpeed },
                        duration: newDuration
                      });
                    }}
                    style={{ width: '100%', accentColor: ACCENT }}
                  />
                </div>
              )}

              {/* Adjustment Sliders (if applicable) */}
              {(selectedLayer.type === 'video' || selectedLayer.type === 'image') && selectedLayer.adjustments && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT_MUTED }}>FILTERS</div>
                    <button
                      onClick={() => updateLayer(selectedLayer.id, {
                        adjustments: { brightness: 0, saturation: 0, contrast: 0, shadow: 0, highlight: 0 }
                      })}
                      style={{ background: 'none', border: 'none', color: ACCENT, fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RotateCcw size={12} /> Reset
                    </button>
                  </div>

                  {['Brightness', 'Contrast', 'Saturation', 'Shadows', 'Highlights'].map(adj => {
                    const key = adj.toLowerCase().replace('highlights', 'highlight').replace('shadows', 'shadow') as keyof typeof selectedLayer.adjustments;
                    const val = selectedLayer.adjustments[key] || 0;
                    return (
                      <div key={adj}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <label style={{ fontSize: '11px', color: TEXT_MUTED }}>{adj}</label>
                          <span style={{ fontSize: '11px', color: 'white' }}>{key === 'brightness' || key === 'saturation' ? Math.round(val * 100) + '%' : Math.round(val)}</span>
                        </div>
                        <input
                          type="range"
                          min={key === 'brightness' || key === 'saturation' ? -1 : -100}
                          max={key === 'brightness' || key === 'saturation' ? 1 : 100}
                          step={key === 'brightness' || key === 'saturation' ? 0.01 : 1}
                          value={val}
                          onChange={e => updateLayer(selectedLayer.id, {
                            adjustments: { ...selectedLayer.adjustments, [key]: parseFloat(e.target.value) }
                          })}
                          style={{ width: '100%', accentColor: ACCENT }}
                        />
                      </div>
                    );
                  })}
                </>
              )}

              {/* Transitions */}
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: TEXT_MUTED, marginBottom: '8px' }}>TRANSITIONS</div>
                
                {/* In Transition */}
                <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '12px', color: 'white', marginBottom: '8px' }}>In Transition</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <select
                      value={selectedLayer.transitions?.in?.type || 'none'}
                      onChange={e => updateLayer(selectedLayer.id, {
                        transitions: { ...selectedLayer.transitions, in: { ...selectedLayer.transitions?.in, type: e.target.value, duration: selectedLayer.transitions?.in?.duration || 1 } }
                      })}
                      style={{ width: '100%', padding: '8px', backgroundColor: INPUT_BG, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: 'white', fontSize: '12px' }}
                    >
                      <option value="none">None</option>
                      <option value="fade">Fade In</option>
                      <option value="slideRight">Slide Right</option>
                      <option value="slideLeft">Slide Left</option>
                      <option value="zoomIn">Zoom In</option>
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number" step="0.1" min="0.1"
                        value={selectedLayer.transitions?.in?.duration || 1}
                        onChange={e => updateLayer(selectedLayer.id, {
                          transitions: { ...selectedLayer.transitions, in: { ...selectedLayer.transitions?.in, type: selectedLayer.transitions?.in?.type || 'none', duration: parseFloat(e.target.value) || 1 } }
                        })}
                        style={{ width: '100%', padding: '8px', backgroundColor: INPUT_BG, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: 'white', fontSize: '12px' }}
                      />
                      <span style={{ fontSize: '11px', color: TEXT_MUTED }}>s</span>
                    </div>
                  </div>
                </div>

                {/* Out Transition */}
                <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '12px', color: 'white', marginBottom: '8px' }}>Out Transition</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <select
                      value={selectedLayer.transitions?.out?.type || 'none'}
                      onChange={e => updateLayer(selectedLayer.id, {
                        transitions: { ...selectedLayer.transitions, out: { ...selectedLayer.transitions?.out, type: e.target.value, duration: selectedLayer.transitions?.out?.duration || 1 } }
                      })}
                      style={{ width: '100%', padding: '8px', backgroundColor: INPUT_BG, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: 'white', fontSize: '12px' }}
                    >
                      <option value="none">None</option>
                      <option value="fade">Fade Out</option>
                      <option value="slideRight">Slide Right</option>
                      <option value="slideLeft">Slide Left</option>
                      <option value="zoomOut">Zoom Out</option>
                    </select>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number" step="0.1" min="0.1"
                        value={selectedLayer.transitions?.out?.duration || 1}
                        onChange={e => updateLayer(selectedLayer.id, {
                          transitions: { ...selectedLayer.transitions, out: { ...selectedLayer.transitions?.out, type: selectedLayer.transitions?.out?.type || 'none', duration: parseFloat(e.target.value) || 1 } }
                        })}
                        style={{ width: '100%', padding: '8px', backgroundColor: INPUT_BG, border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', color: 'white', fontSize: '12px' }}
                      />
                      <span style={{ fontSize: '11px', color: TEXT_MUTED }}>s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
