"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/editor/Navbar';
import { useStore } from '@/store/useStore';
import { generateVideo, type VideoSettings } from './actions';

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const Ico = {
  Close:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Play:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Film:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>,
  Wand:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></svg>,
  Spinner:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation:'spin 1s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>,

  // Model icons
  ModelA:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>,
  ModelB:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  ModelC:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,

  // Resolution icons
  Res360:   () => <svg width="13" height="10" viewBox="0 0 26 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="1" y="1" width="24" height="16" rx="1.5"/></svg>,
  Res540:   () => <svg width="15" height="11" viewBox="0 0 30 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="1" y="1" width="28" height="18" rx="1.5"/></svg>,
  Res720:   () => <svg width="16" height="11" viewBox="0 0 32 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="1" y="1" width="30" height="18" rx="1.5"/><line x1="16" y1="5" x2="16" y2="15" strokeWidth="1.5" strokeOpacity="0.6"/></svg>,
  Res1080:  () => <svg width="16" height="11" viewBox="0 0 32 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="1" y="1" width="30" height="18" rx="1.5"/><line x1="11" y1="5" x2="11" y2="15" strokeWidth="1.5" strokeOpacity="0.6"/><line x1="21" y1="5" x2="21" y2="15" strokeWidth="1.5" strokeOpacity="0.6"/></svg>,

  // Aspect ratio icons
  Wide:     () => <svg width="16" height="10" viewBox="0 0 32 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="1" width="30" height="16" rx="1.5"/></svg>,
  Vertical: () => <svg width="9" height="15" viewBox="0 0 16 26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="1" width="14" height="24" rx="1.5"/></svg>,
  Square:   () => <svg width="13" height="13" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="1" width="20" height="20" rx="1.5"/></svg>,
  Cinema:   () => <svg width="18" height="8" viewBox="0 0 36 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="1" width="34" height="12" rx="1.5"/></svg>,

  // FPS icons
  FPS8:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>,
  FPS16:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 15 13.5"/><line x1="17" y1="7" x2="19" y2="5" strokeWidth="1.5"/></svg>,
  FPS24:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  FPS30:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/><circle cx="19" cy="5" r="2" fill="currentColor" stroke="none"/></svg>,

  // Duration icons
  Dur2:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/></svg>,
  Dur4:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l2.5 2.5"/></svg>,
  Dur5:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
  Dur8:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 3.5"/></svg>,
  Dur10:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 3"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></svg>,
};

// ─── Types ────────────────────────────────────────────────────────────────────
type GenerationRecord = {
  id: string; prompt: string; url: string; timestamp: number;
  settings: { model: string; resolution: string; aspectRatio: string; fps: string; duration: string };
};
type IBOption = { value: string; label: string; Icon: () => React.ReactNode; desc?: string };

// ─── IconButtonGroup ──────────────────────────────────────────────────────────
function IconButtonGroup({ label, sectionIcon: SectionIcon, options, selected, onChange, cols = 4 }: {
  label: string; sectionIcon: () => React.ReactNode;
  options: IBOption[]; selected: string; onChange: (v: string) => void; cols?: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[var(--text-muted)] opacity-60"><SectionIcon /></span>
        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-[0.14em] font-bold">{label}</span>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {options.map(({ value, label: lbl, Icon, desc }) => {
          const active = selected === value;
          return (
            <button key={value} onClick={() => onChange(value)} title={desc ?? lbl}
              className={`
                relative flex flex-col items-center justify-center gap-1 py-2.5 rounded-lg
                text-[9px] font-semibold border transition-all duration-150 select-none group
                ${active
                  ? 'bg-[var(--accent)]/15 border-[var(--accent)]/60 text-[var(--accent)]'
                  : 'bg-[var(--bg-dark)]/70 border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-element)] hover:border-white/20 hover:text-white'
                }
              `}
              style={active ? { boxShadow: '0 0 10px 0 var(--accent-glow, rgba(139,92,246,0.25))' } : {}}
            >
              {active && <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[var(--accent)]" />}
              <span className={`transition-transform duration-150 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
                <Icon />
              </span>
              <span className="leading-none">{lbl}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── ModelCardSelector ────────────────────────────────────────────────────────
function ModelCardSelector({ options, selected, onChange }: {
  options: { value: string; label: string; tag: string; Icon: () => React.ReactNode }[];
  selected: string; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[var(--text-muted)] opacity-60"><Ico.ModelA /></span>
        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-[0.14em] font-bold">Model</span>
      </div>
      <div className="flex flex-col gap-1">
        {options.map(({ value, label, tag, Icon }) => {
          const active = selected === value;
          return (
            <button key={value} onClick={() => onChange(value)}
              className={`
                w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left
                transition-all duration-150
                ${active
                  ? 'bg-[var(--accent)]/12 border-[var(--accent)]/50'
                  : 'bg-[var(--bg-dark)]/60 border-[var(--border)] hover:bg-[var(--bg-element)] hover:border-white/20'
                }
              `}
              style={active ? { boxShadow: '0 0 12px 0 var(--accent-glow, rgba(139,92,246,0.2))' } : {}}
            >
              <span className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition-colors
                ${active ? 'bg-[var(--accent)]/25 text-[var(--accent)]' : 'bg-[var(--bg-element)] text-[var(--text-muted)]'}`}>
                <Icon />
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-[11px] font-semibold leading-none truncate ${active ? 'text-[var(--accent)]' : 'text-[var(--text-main)]'}`}>{label}</p>
                <p className="text-[9px] text-[var(--text-muted)] mt-0.5 truncate opacity-60">{tag}</p>
              </div>
              {active && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── View All Modal ───────────────────────────────────────────────────────────
function ViewAllModal({ history, onClose, onSelect }: {
  history: GenerationRecord[]; onClose: () => void; onSelect: (r: GenerationRecord) => void;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={backdropRef} onClick={e => { if (e.target === backdropRef.current) onClose(); }}
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-end justify-center pb-24">
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-4xl mx-6 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Ico.Film />
            <h2 className="font-semibold text-sm">All Generated Videos</h2>
            {history.length > 0 && <span className="text-[10px] bg-[var(--accent)]/20 text-[var(--accent)] px-2 py-0.5 rounded-full font-bold">{history.length}</span>}
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white p-1 rounded hover:bg-[var(--bg-element)] transition-colors"><Ico.Close /></button>
        </div>
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)]">
              <div className="mx-auto mb-3 w-8 h-8 opacity-40 flex items-center justify-center"><Ico.Film /></div>
              <p className="text-sm">No videos generated yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {history.map(r => (
                <div key={r.id} onClick={() => { onSelect(r); onClose(); }}
                  className="group relative rounded-xl overflow-hidden border border-[var(--border)] cursor-pointer hover:border-[var(--accent)] transition-all hover:scale-[1.02] bg-black">
                  <video src={r.url} className="w-full aspect-video object-cover opacity-80 group-hover:opacity-100 transition-opacity" muted loop
                    onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                    onMouseLeave={e => { const v = e.currentTarget as HTMLVideoElement; v.pause(); v.currentTime = 0; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    <p className="text-[10px] text-white line-clamp-2 leading-tight">{r.prompt}</p>
                  </div>
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5">
                    <span className="text-[9px] text-[var(--text-muted)]">{r.settings.resolution} · {r.settings.fps}</span>
                  </div>
                  <div className="px-2 py-1.5 bg-[var(--bg-element)]">
                    <p className="text-[9px] text-[var(--text-muted)] truncate">{new Date(r.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
const Divider = () => <div className="h-px bg-[var(--border)] opacity-40" />;

// ─── Section icons ────────────────────────────────────────────────────────────
const IcoResolution = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="1"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
const IcoAspect     = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18" strokeWidth="1" strokeOpacity="0.5"/></svg>;
const IcoFPS        = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
const IcoClock      = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>;

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FireflyUI() {
  const router = useRouter();

  const [model, setModel]           = useState('damo-vilab/text-to-video-ms-1.7b');
  const [resolution, setResolution] = useState('540p');
  const [aspectRatio, setAspect]    = useState('Widescreen (16:9)');
  const [fps, setFps]               = useState('24 FPS');
  const [duration, setDuration]     = useState('5 seconds');

  const [promptText, setPrompt]       = useState('a cat walking on the moon');
  const [isGenerating, setGenerating] = useState(false);
  const aiVideoSrc    = useStore(s => s.aiVideoSrc);
  const setAiVideoSrc = useStore(s => s.setAiVideoSrc);

  const [history, setHistory]         = useState<GenerationRecord[]>([]);
  const [showViewAll, setShowViewAll] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // ── Option data ──
  const MODEL_OPTIONS = [
    { value: 'damo-vilab/text-to-video-ms-1.7b',    label: 'MS Video 1.7B',  tag: 'damo-vilab · balanced',    Icon: Ico.ModelA },
    { value: 'damo-vilab/text-to-video-ms-1.7b-xl', label: 'MS Video XL',    tag: 'damo-vilab · high detail',  Icon: Ico.ModelB },
    { value: 'cerspense/zeroscope_v2_xl',            label: 'Zeroscope XL',   tag: 'cerspense · cinematic',     Icon: Ico.ModelC },
    { value: 'cerspense/zeroscope_v2_576w',          label: 'Zeroscope 576w', tag: 'cerspense · fast',          Icon: Ico.ModelA },
  ];

  const RESOLUTION_OPTS: IBOption[] = [
    { value: '360p',  label: '360p',  Icon: Ico.Res360,  desc: 'Low — fastest' },
    { value: '540p',  label: '540p',  Icon: Ico.Res540,  desc: 'Medium — balanced' },
    { value: '720p',  label: '720p',  Icon: Ico.Res720,  desc: 'HD — sharp' },
    { value: '1080p', label: '1080p', Icon: Ico.Res1080, desc: 'Full HD — slow' },
  ];

  const ASPECT_OPTS: IBOption[] = [
    { value: 'Widescreen (16:9)', label: '16:9', Icon: Ico.Wide,     desc: 'Widescreen' },
    { value: 'Vertical (9:16)',   label: '9:16', Icon: Ico.Vertical, desc: 'Vertical / Reels' },
    { value: 'Square (1:1)',      label: '1:1',  Icon: Ico.Square,   desc: 'Square' },
    { value: 'Cinematic (21:9)',  label: '21:9', Icon: Ico.Cinema,   desc: 'Cinematic' },
  ];

  const FPS_OPTS: IBOption[] = [
    { value: '8 FPS',  label: '8',  Icon: Ico.FPS24,  desc: '8 FPS — slowest' },
    { value: '16 FPS', label: '16', Icon: Ico.FPS24, desc: '16 FPS' },
    { value: '24 FPS', label: '24', Icon: Ico.FPS24, desc: '24 FPS — cinematic' },
    { value: '30 FPS', label: '30', Icon: Ico.FPS30, desc: '30 FPS — smooth' },
  ];

  const DURATION_OPTS: IBOption[] = [
    { value: '2 seconds',  label: '2s',  Icon: Ico.Dur2,  desc: '2 seconds' },
    { value: '4 seconds',  label: '4s',  Icon: Ico.Dur4,  desc: '4 seconds' },
    { value: '5 seconds',  label: '5s',  Icon: Ico.Dur5,  desc: '5 seconds' },
    { value: '8 seconds',  label: '8s',  Icon: Ico.Dur8,  desc: '8 seconds' },
    { value: '10 seconds', label: '10s', Icon: Ico.Dur10, desc: '10 seconds' },
  ];

  const handleGenerate = async () => {
    if (!promptText.trim() || isGenerating) return;
    setGenerating(true);
    try {
      const result = await generateVideo(promptText, { model, resolution, aspectRatio, fps, duration });
      if (result.success && result.url) {
        setAiVideoSrc(result.url);
        setHistory(prev => [{
          id: `gen-${Date.now()}`, prompt: promptText, url: result.url!,
          timestamp: Date.now(), settings: { model, resolution, aspectRatio, fps, duration },
        }, ...prev]);
        setTimeout(() => {
          setShowSuccessModal(true);
        }, 5000);
      } else {
        alert(result.error || 'Generation failed. Make sure ngrok is running.');
      }
    } catch {
      alert('Error generating video');
    } finally {
      setGenerating(false);
    }
  };

  const currentModelLabel = MODEL_OPTIONS.find(m => m.value === model)?.label ?? 'Model';

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-dark)] text-white">

      {/* ── Navbar ── */}
      <Navbar showProjectTitle={false} showUndoRedo={false} showPreview={false}
        primaryActionText="Download"
        onPrimaryAction={() => {
          if (aiVideoSrc) { const a = document.createElement('a'); a.href = aiVideoSrc; a.download = 'generated_video.mp4'; a.click(); }
          else alert('No video to download yet!');
        }}
      />

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ─────────────── Left Sidebar ─────────────── */}
        <aside className="w-[234px] border-r border-[var(--border)] bg-[var(--bg-panel)] flex flex-col overflow-y-auto">
          <div className="p-4 space-y-5">

            {/* Model */}
            <ModelCardSelector options={MODEL_OPTIONS} selected={model} onChange={setModel} />

            <Divider />

            {/* Resolution — 4 cols */}
            <IconButtonGroup label="Resolution" sectionIcon={IcoResolution}
              options={RESOLUTION_OPTS} selected={resolution} onChange={setResolution} cols={4} />

            {/* Aspect Ratio — 4 cols */}
            <IconButtonGroup label="Aspect Ratio" sectionIcon={IcoAspect}
              options={ASPECT_OPTS} selected={aspectRatio} onChange={setAspect} cols={4} />

            <Divider />

            {/* FPS — 4 cols */}
            <IconButtonGroup label="Frames / Second" sectionIcon={IcoFPS}
              options={FPS_OPTS} selected={fps} onChange={setFps} cols={4} />

            {/* Duration — 5 cols */}
            <IconButtonGroup label="Duration" sectionIcon={IcoClock}
              options={DURATION_OPTS} selected={duration} onChange={setDuration} cols={5} />

            <Divider />

            {/* Active config chips */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-[0.14em] font-bold">Active Config</span>
              <div className="flex flex-wrap gap-1">
                {[resolution, aspectRatio.match(/\(([^)]+)\)/)?.[1] ?? aspectRatio, fps, duration.replace(' seconds','s')].map(v => (
                  <span key={v} className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--bg-dark)] border border-[var(--border)] text-[var(--text-muted)]">{v}</span>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* ─────────────── Main Content ─────────────── */}
        <main className="flex-1 bg-[var(--bg-dark)] flex flex-col items-center justify-start pt-12 relative overflow-hidden">

          {/* Video player */}
          <div className="w-full max-w-4xl px-4 relative group">
            <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl relative bg-black border border-[var(--border)]">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--bg-dark)] z-10">
                  <div className="w-16 h-16 border-4 border-[var(--accent)]/20 border-t-[var(--accent)] rounded-full animate-spin" />
                  <span className="text-sm font-medium animate-pulse">Generating via Colab GPU…</span>
                  <span className="text-[11px] text-[var(--text-muted)]">{currentModelLabel} · {resolution} · {fps} · {duration}</span>
                </div>
              ) : aiVideoSrc ? (
                <video src={aiVideoSrc} className="w-full h-full object-contain" autoPlay loop controls />
              ) : (
                <>
                  <img src="https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2070&auto=format&fit=crop" alt="" className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Prompt bar ── */}
          <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-[var(--bg-panel)] rounded-2xl border border-[var(--border)] p-4 shadow-xl">
                <div className="flex gap-4 items-end">
                  <div className="flex-1 flex flex-col gap-3">

                    {/* History strip */}
                    <div className="flex gap-2 items-center">
                      {/* <button onClick={() => setShowViewAll(true)}
                        className="text-[10px] bg-[var(--bg-element)] hover:bg-[var(--bg-dark)] px-2.5 py-1 rounded text-[var(--text-muted)] hover:text-white transition-colors border border-[var(--border)] flex items-center gap-1 whitespace-nowrap">
                        View All
                        {history.length > 0 && (
                          <span className="bg-[var(--accent)] text-white text-[8px] rounded-full px-1 font-bold">{history.length}</span>
                        )}
                      </button> */}
                      <div className="flex gap-1.5 overflow-hidden">
                        {history.slice(0, 5).map(r => (
                          <div key={r.id} title={r.prompt} onClick={() => setAiVideoSrc(r.url)}
                            className="w-12 h-8 rounded bg-[var(--bg-dark)] overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] cursor-pointer transition-all flex-shrink-0 group">
                            <video src={r.url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" muted
                              onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                              onMouseLeave={e => { const v = e.currentTarget as HTMLVideoElement; v.pause(); v.currentTime = 0; }} />
                          </div>
                        ))}
                        {history.length === 0 && (
                          <div className="w-12 h-8 rounded bg-[var(--bg-dark)] border border-[var(--border)] opacity-30 flex-shrink-0">
                            <img src="https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=150&auto=format&fit=crop" className="w-full h-full object-cover" alt="" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Prompt textarea */}
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">Prompt</span>
                      <textarea
                        className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm resize-none h-12 w-full mt-1 text-white placeholder:text-[var(--text-muted)]"
                        value={promptText}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="Describe your video…"
                        disabled={isGenerating}
                        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
                      />
                    </div>
                  </div>

                  {/* Generate button */}
                  <button onClick={handleGenerate} disabled={isGenerating || !promptText.trim()}
                    className={`text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg transition-all
                      ${isGenerating || !promptText.trim()
                        ? 'bg-[var(--accent)]/40 cursor-not-allowed'
                        : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-95'}`}>
                    {isGenerating
                      ? <><Ico.Spinner /> Generating…</>
                      : <><Ico.Wand /> Generate</>}
                  </button>
                </div>

                <p className="text-[10px] text-[var(--text-muted)] mt-2 text-right opacity-50">
                  ⌘↵ to generate · {currentModelLabel} · {resolution} · {fps} · {duration}
                </p>
            </div>
          </div>
        </main>
      </div>

      {/* View All modal */}
      {showViewAll && <ViewAllModal history={history} onClose={() => setShowViewAll(false)} onSelect={r => setAiVideoSrc(r.url)} />}

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal 
          onClose={() => setShowSuccessModal(false)} 
          onTryEditor={() => router.push(`/editor?videoUrl=${encodeURIComponent(aiVideoSrc || '')}`)} 
        />
      )}

      {/* Inline keyframe for spinner */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Success Modal ───────────────────────────────────────────────────────────
function SuccessModal({ onClose, onTryEditor }: { onClose: () => void; onTryEditor: () => void }) {
  return (
    <div className="fixed bottom-7 right-7 z-[110] slide-in-right">
      <div className="bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl shadow-2xl w-[320px] overflow-hidden relative group">
        {/* Subtle Glow */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-[var(--accent)]/10 blur-[40px] rounded-full" />
        
        <div className="p-5 relative z-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-[var(--accent)]/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-[var(--accent)]/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[var(--accent)]">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="flex-1 pt-1">
              <h2 className="text-base font-bold gradient-text">Video Ready!</h2>
              <p className="text-[var(--text-muted)] text-[11px] leading-snug mt-1">
                Take it to the next level with professional editing tools.
              </p>
            </div>
            <button onClick={onClose} className="text-[var(--text-muted)] hover:text-white transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={onTryEditor}
              className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[11px] font-bold py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 group/btn"
            >
              <span>Try Editor App</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover/btn:translate-x-0.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button 
              onClick={onClose}
              className="px-4 bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white text-[11px] font-semibold py-2.5 rounded-xl transition-all border border-white/5"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}