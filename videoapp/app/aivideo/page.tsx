"use client";
import React, { useState, useRef, useEffect } from 'react';
import { generateVideo } from './actions';

// Icons as SVG components to avoid external dependency issues
const Icons = {
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  ChevronDown: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  Download: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
  Check: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  MessageSquare: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>,
  Grid: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  Upload: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
  History: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline><path d="M3.3 7a9 9 0 1 1 0 10"></path></svg>,
  Help: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>,
  Music: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>,
  Scissors: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>,
  Split: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M8 6l-4 6 4 6"></path><path d="M16 6l4 6-4 6"></path></svg>,
};

type DropdownProps = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (val: string) => void;
  isMulti?: boolean;
  hasIcon?: boolean;
};

const Dropdown = ({ label, options, selected, onChange, isMulti = true, hasIcon = false }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayText = selected.length === 0
    ? 'Select'
    : selected.length > 2
      ? `${selected.length} selected`
      : selected.join(', ');

  return (
    <div className="space-y-1.5 relative" ref={dropdownRef}>
      <label className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{label}</label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between bg-[#0a0a0a] p-2.5 rounded border ${isOpen ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-[#333]'} cursor-pointer hover:border-[#555] transition-all`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {hasIcon && <div className="w-4 h-4 bg-red-600 rounded-sm flex-shrink-0"></div>}
          <span className="text-sm truncate font-medium text-gray-200">{displayText}</span>
        </div>
        <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : 'text-gray-500'}`}>
          <Icons.ChevronDown />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e1e] border border-[#333] rounded shadow-2xl z-50 max-h-60 overflow-y-auto py-1 ring-1 ring-black/50">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                onChange(option);
                if (!isMulti) setIsOpen(false);
              }}
              className="flex items-center justify-between px-3 py-2 hover:bg-[#2a2a2a] cursor-pointer group transition-colors"
            >
              <span className={`text-sm ${selected.includes(option) ? 'text-blue-400 font-medium' : 'text-gray-300'}`}>
                {option}
              </span>
              {selected.includes(option) && (
                <span className="text-blue-500 animate-in zoom-in-50">
                  <Icons.Check />
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function FireflyUI() {
  const [resolutions, setResolutions] = useState(['540p']);
  const [aspectRatios, setAspectRatios] = useState(['Widescreen (16:9)']);
  const [fps, setFps] = useState(['24 FPS']);
  const [durations, setDurations] = useState(['5 seconds']);
  const [model, setModel] = useState(['Firefly Video']);

  const toggleSelection = (current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>, val: string, isMulti: boolean) => {
    if (!isMulti) {
      setter([val]);
      return;
    }
    if (current.includes(val)) {
      if (current.length > 1) {
        setter(current.filter(i => i !== val));
      }
    } else {
      setter([...current, val]);
    }
  };
  const [firstFrame, setFirstFrame] = useState<string | null>(null);
  const [lastFrame, setLastFrame] = useState<string | null>(null);
  const [referenceVideo, setReferenceVideo] = useState<string | null>(null);

  const [promptText, setPromptText] = useState("a cat walking on the moon");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('Generate');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerate = async () => {
    if (!promptText.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateVideo(promptText);
      if (result.success && result.url) {
        setVideoSrc(result.url);
      } else {
        alert(result.error || "Failed to generate video. Make sure ngrok is running and try again.");
      }
    } catch (err) {
      alert("Error generating video");
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateUpload = (setter: (val: string | null) => void, name: string) => {
    setter(`${name}_uploaded.jpg`);
  };

  return (
    <div className="flex flex-col h-screen bg-[#121212] text-white">
      {/* Top Navbar */}
      <header className="h-14 border-b border-[#333] flex items-center justify-between px-4 bg-[#1e1e1e]">
        <div className="flex items-center gap-4">
          <div className="bg-red-600 font-bold px-2 py-1 rounded text-xs">Fi</div>
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm font-medium">Generate video</span>
            <Icons.ChevronDown />
          </div>
        </div>

        <nav className="flex items-center gap-8 h-full">
          {['Gallery', 'Generate', 'Edit'].map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-full flex items-center px-1 border-b-2 cursor-pointer transition-colors ${activeTab === tab ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white'}`}
            >
              {tab}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#333] hover:bg-[#444] text-sm transition-colors">
            <Icons.Download />
            Download
          </button>
          <button className="px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-sm font-semibold hover:opacity-90 transition-opacity">
            Upgrade
          </button>
          <div className="flex items-center gap-4 ml-2">
            <Icons.MessageSquare />
            <Icons.Grid />
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-green-300"></div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[300px] border-r border-[#333] bg-[#1e1e1e] flex flex-col overflow-y-auto">
          {activeTab === 'Edit' ? (
            <div className="p-4 space-y-6">
              <h2 className="text-lg font-bold mb-4">Edit Video</h2>
            </div>
          ) : (
            <>
              {/* General Settings */}
              <section className="p-4 border-b border-[#333]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Icons.ChevronDown />
                    General settings
                  </h3>
                </div>

                <div className="space-y-4">
                  <Dropdown
                    label="Model"
                    options={['Firefly Video', 'Firefly Image 3', 'Firefly Image 2']}
                    selected={model}
                    onChange={(val) => toggleSelection(model, setModel, val, false)}
                    isMulti={false}
                  />
                  <Dropdown
                    label="Resolution"
                    options={['540p', '720p', '1080p', '4K']}
                    selected={resolutions}
                    onChange={(val) => toggleSelection(resolutions, setResolutions, val, true)}
                  />
                  <Dropdown
                    label="Aspect ratio"
                    options={['Widescreen (16:9)', 'Vertical (9:16)', 'Square (1:1)']}
                    selected={aspectRatios}
                    onChange={(val) => toggleSelection(aspectRatios, setAspectRatios, val, true)}
                  />
                  <Dropdown
                    label="Frames per second"
                    options={['24 FPS', '30 FPS', '60 FPS']}
                    selected={fps}
                    onChange={(val) => toggleSelection(fps, setFps, val, true)}
                  />
                  <Dropdown
                    label="Duration"
                    options={['5 seconds', '10 seconds', '15 seconds', '20 seconds']}
                    selected={durations}
                    onChange={(val) => toggleSelection(durations, setDurations, val, true)}
                  />
                </div>
              </section>

              {/* Frames */}
              <section className="p-4 border-b border-[#333]">
                <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                  <Icons.ChevronDown />
                  Frames <Icons.Help />
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => simulateUpload(setFirstFrame, 'first_frame')}
                    className={`aspect-video rounded border border-dashed flex flex-col items-center justify-center gap-2 text-xs transition-colors cursor-pointer ${firstFrame ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 'bg-[#0a0a0a] border-[#333] text-gray-400 hover:bg-[#121212]'}`}
                  >
                    <Icons.Upload />
                    {firstFrame ? 'Frame 1' : 'First'}
                  </div>
                  <div
                    onClick={() => simulateUpload(setLastFrame, 'last_frame')}
                    className={`aspect-video rounded border border-dashed flex flex-col items-center justify-center gap-2 text-xs transition-colors cursor-pointer ${lastFrame ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 'bg-[#0a0a0a] border-[#333] text-gray-400 hover:bg-[#121212]'}`}
                  >
                    <Icons.Upload />
                    {lastFrame ? 'Frame N' : 'Last'}
                  </div>
                </div>
              </section>

              {/* Composition */}
              <section className="p-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Icons.ChevronDown />
                  Composition
                </h3>
                <p className="text-[11px] text-gray-400 mb-4">
                  Videos must be 10 seconds long and under 10 MB. Longer videos will be trimmed to the first 5 seconds.
                </p>

                <div className="space-y-4">
                  <div className="bg-[#252525] p-4 rounded-lg border border-[#333]">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium flex items-center gap-2">
                        <Icons.Upload />
                        Reference
                      </span>
                      <Icons.Upload />
                    </div>
                    <div
                      onClick={() => simulateUpload(setReferenceVideo, 'ref_video')}
                      className={`aspect-square rounded border border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${referenceVideo ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 'bg-[#121212] border-[#333] hover:bg-[#1a1a1a]'}`}
                    >
                      <div className={`p-2 rounded-full ${referenceVideo ? 'bg-blue-500 text-white' : 'bg-[#1e1e1e]'}`}>
                        <Icons.Upload />
                      </div>
                      <button className={`px-4 py-1.5 rounded-full text-xs transition-colors ${referenceVideo ? 'bg-blue-600' : 'bg-[#333] hover:bg-[#444]'}`}>
                        {referenceVideo ? 'Video uploaded' : 'Upload video'}
                      </button>
                      {referenceVideo && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setReferenceVideo(null); }}
                          className="text-xs text-gray-500 hover:text-white flex items-center gap-1 mt-2"
                        >
                          <Icons.History />
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </aside>

        {/* Central Display */}
        <main className="flex-1 bg-[#121212] p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="w-full max-w-4xl relative group">
            <div className="aspect-video rounded-3xl overflow-hidden mb-8 shadow-2xl relative bg-black border border-[#333]">
              {(isGenerating || isProcessing) ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#121212] z-10">
                  <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                  <span className="text-sm font-medium animate-pulse text-white">{isGenerating ? "Generating video on Colab GPU..." : "Processing video with FFmpeg..."}</span>
                </div>
              ) : videoSrc ? (
                <video
                  src={videoSrc}
                  className="w-full h-full object-contain"
                  autoPlay
                  loop
                  controls
                />
              ) : (
                <>
                  <img
                    src="https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2070&auto=format&fit=crop"
                    alt="Cityscape"
                    className="w-full h-full object-cover opacity-60"
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom Prompt Bar */}
          {activeTab === 'Generate' && (
            <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-4">
              <div className="bg-[#1e1e1e] rounded-2xl border border-[#333] p-4 shadow-xl">
                <div className="flex gap-4 items-end">
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex gap-2">
                      <div className="text-[10px] bg-[#333] px-2 py-0.5 rounded text-gray-300 cursor-pointer">View All</div>
                      <div className="w-12 h-8 rounded bg-[#0a0a0a] overflow-hidden border border-blue-500 cursor-pointer">
                        <img src="https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=150&auto=format&fit=crop" className="w-full h-full mb-4 object-cover opacity-50" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-medium uppercase">Prompt</span>
                      <textarea
                        className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm resize-none h-12 w-full mt-1 text-white"
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        disabled={isGenerating}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className={`text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-lg transition-all ${isGenerating
                        ? 'bg-blue-600/50 cursor-not-allowed shadow-none'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 active:scale-95'
                        }`}
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Icons.Upload />
                          Generate
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
