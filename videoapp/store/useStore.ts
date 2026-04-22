import { create } from 'zustand';

export type LayerType = "video" | "audio" | "image" | "text" | "shape" | "emoji";

export interface Track {
  id: string;
  name: string;
  isLocked: boolean;
  isVisible: boolean;
  isMuted?: boolean;
  volume?: number;
}

export interface TransformProps {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  speed: number;
  flipX: boolean;
  flipY: boolean;
  crop?: { left: number, right: number, top: number, bottom: number };
}
export interface Layer {
  id: string;
  type: LayerType;
  name: string;
  startAt: number;     // seconds
  duration: number;    // seconds
  track: string;       // ID of the track
  isVisible: boolean;
  isLocked: boolean;
  content?: string;
  thumbnail?: string;
  url?: string;
  font?: string;
  fontSize?: number;
  color?: string;
  align?: string;
  verticalAlign?: string;
  serverPath?: string;
  trimStart: number;
  totalDuration: number;
  transform: TransformProps;
  adjustments: {
    brightness: number;
    saturation: number;
    contrast: number;
    shadow: number;
    highlight: number;
  };
  transitions?: {
    in?: { type: string; duration: number };
    out?: { type: string; duration: number };
  };
}

interface HistorySnapshot {
  canvas: {
    width: number;
    height: number;
    aspectRatio: string;
    backgroundColor: string;
  };
  tracks: Track[];
  layers: Layer[];
}

interface EditorState {
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  zoom: number;
  masterVolume: number;
  selectedLayerId: string | null;
  canvas: {
    width: number;
    height: number;
    aspectRatio: string;
    backgroundColor: string;
  };
  tracks: Track[];
  layers: Layer[];
  sidebarTextColor: string;
  past: HistorySnapshot[];
  future: HistorySnapshot[];
  aiVideoSrc: string | null;
  
  // Actions
  setAiVideoSrc: (src: string | null) => void;
  undo: () => void;
  redo: () => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setDuration: (dur: number) => void;
  setZoom: (zoom: number) => void;
  setMasterVolume: (volume: number) => void;
  setSelectedLayerId: (id: string | null) => void;
  setCanvasSettings: (settings: Partial<EditorState["canvas"]>) => void;
  takeSnapshot: () => void;
  
  addLayer: (layer: Omit<Layer, "id" | "trimStart" | "totalDuration" | "track" | "adjustments"> & { trimStart?: number, totalDuration?: number, track?: string, adjustments?: Partial<Layer["adjustments"]> }) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  splitLayer: (id: string, splitAt: number) => void;
  moveLayerTrack: (id: string, newTrackId: string) => void;
  addTrack: (name?: string) => string;
  deleteTrack: (trackId: string) => void;
  reorderTracks: (startIndex: number, endIndex: number) => void;
  toggleTrackProperty: (trackId: string, property: 'isLocked' | 'isVisible' | 'isMuted') => void;
  updateTrack: (id: string, updates: Partial<Track>) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);
const calculateDuration = (layers: Layer[]) => layers.length > 0 ? Math.max(0, ...layers.map(l => l.startAt + l.duration)) : 0;

export const useStore = create<EditorState>((set, get) => ({
  currentTime: 0,
  isPlaying: false,
  duration: 0,
  zoom: 10,
  masterVolume: 1,
  selectedLayerId: null,
  
  canvas: {
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    backgroundColor: "#000000"
  },

  tracks: [],

  layers: [],
  sidebarTextColor: "#ffffff",
  past: [],
  future: [],
  aiVideoSrc: null,

  setAiVideoSrc: (src) => set({ aiVideoSrc: src }),

  // Helper to save history
  takeSnapshot: () => {
    const state = get();
    const snapshot: HistorySnapshot = JSON.parse(JSON.stringify({
      canvas: state.canvas,
      tracks: state.tracks,
      layers: state.layers
    }));

    set({
      past: [...state.past.slice(-49), snapshot], // Limit to 50 steps
      future: [] // Clear redo stack on new action
    });
  },

  undo: () => {
    const { past, future, canvas, tracks, layers } = get();
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    // Save current state to future for redo
    const currentSnapshot: HistorySnapshot = JSON.parse(JSON.stringify({ canvas, tracks, layers }));

    set({
      canvas: previous.canvas,
      tracks: previous.tracks,
      layers: previous.layers,
      past: newPast,
      future: [currentSnapshot, ...future].slice(0, 50),
      // Recalculate duration if needed
      duration: calculateDuration(previous.layers)
    });
  },

  redo: () => {
    const { past, future, canvas, tracks, layers } = get();
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    // Save current state to past for undo
    const currentSnapshot: HistorySnapshot = JSON.parse(JSON.stringify({ canvas, tracks, layers }));

    set({
      canvas: next.canvas,
      tracks: next.tracks,
      layers: next.layers,
      future: newFuture,
      past: [...past, currentSnapshot].slice(-50),
      duration: calculateDuration(next.layers)
    });
  },

  setCurrentTime: (time) => set({ currentTime: time }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setDuration: (duration) => set({ duration }),
  setZoom: (zoom) => set({ zoom }),
  setMasterVolume: (volume) => set({ masterVolume: volume }),
  setSelectedLayerId: (id) => set({ selectedLayerId: id }),
  setCanvasSettings: (settings) => {
    get().takeSnapshot();
    set((state) => {
      const newCanvas = { ...state.canvas, ...settings };
      
      // If aspect ratio changed, update dimensions
      if (settings.aspectRatio && settings.aspectRatio !== "Custom") {
        switch (settings.aspectRatio) {
          case "16:9": newCanvas.width = 1920; newCanvas.height = 1080; break;
          case "9:16": newCanvas.width = 1080; newCanvas.height = 1920; break;
          case "1:1":  newCanvas.width = 1080; newCanvas.height = 1080; break;
          case "4:3":  newCanvas.width = 1440; newCanvas.height = 1080; break;
        }
      } 
      // If width/height changed manually, set ratio to Custom
      else if ((settings.width || settings.height) && !settings.aspectRatio) {
        newCanvas.aspectRatio = "Custom";
      }

      return { canvas: newCanvas };
    });
  },

  addLayer: (layer) => {
    get().takeSnapshot();
    set((state) => {
      let trackId = layer.track;
      let newTracks = state.tracks;

      // If no track provided or it doesn't exist, create a new one
      if (!trackId || !state.tracks.some(t => t.id === trackId)) {
        trackId = generateId();
        const newTrack: Track = {
          id: trackId,
          name: `${layer.name || 'New'} Track`,
          isLocked: false,
          isVisible: true
        };
        newTracks = [newTrack, ...state.tracks];
      }
      
      const newLayer = { 
        trimStart: 0, 
        totalDuration: (layer.type === 'text' || layer.type === 'shape' || layer.type === 'emoji') ? 3600 : (layer.duration || 10), 
        ...layer, 
        id: generateId(),
        track: trackId,
        adjustments: {
          brightness: 0,
          saturation: 0,
          contrast: 0,
          shadow: 0,
          highlight: 0
        },
        transitions: {
          in: { type: 'none', duration: 1 },
          out: { type: 'none', duration: 1 }
        }
      } as Layer;
      
      const newLayers = [...state.layers, newLayer];
      const newDuration = Math.max(0, ...newLayers.map(l => l.startAt + l.duration));
      
      // Async fetch exact dimension/duration for media globally so it applies immediately on drop
      if (typeof window !== 'undefined' && (newLayer.type === 'video' || newLayer.type === 'audio') && newLayer.url) {
        const media = document.createElement(newLayer.type);
        media.src = newLayer.url;
        media.crossOrigin = 'anonymous'; // helps with some CORS headers if needed
        media.onloadedmetadata = () => {
          if (media.duration && media.duration !== Infinity) {
             const isUntrimmed = newLayer.duration === newLayer.totalDuration;
             useStore.getState().updateLayer(newLayer.id, {
               totalDuration: media.duration,
               ...(isUntrimmed ? { duration: media.duration } : {})
             });
          }
        };
      }
      
      return { 
        tracks: newTracks,
        layers: newLayers,
        selectedLayerId: newLayer.id,
        duration: newDuration,
        currentTime: Math.min(state.currentTime, newDuration)
      };
    });
  },

  updateLayer: (id, updates) => {
    get().takeSnapshot();
    set((state) => {
      const newLayers = state.layers.map(layer => layer.id === id ? { ...layer, ...updates } : layer);
      const newDuration = Math.max(0, ...newLayers.map(l => l.startAt + l.duration));
      return {
        layers: newLayers,
        duration: newDuration,
        currentTime: Math.min(state.currentTime, newDuration)
      };
    });
  },

  deleteLayer: (id) => {
    get().takeSnapshot();
    set((state) => {
      const newLayers = state.layers.filter(layer => layer.id !== id);
      const newDuration = newLayers.length > 0 ? Math.max(0, ...newLayers.map(l => l.startAt + l.duration)) : 0;
      return {
        layers: newLayers,
        selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
        duration: newDuration,
        currentTime: Math.min(state.currentTime, newDuration)
      };
    });
  },

  duplicateLayer: (id) => {
    get().takeSnapshot();
    const state = get();
    const layerToCopy = state.layers.find(l => l.id === id);
    if (!layerToCopy) return;
    const newLayer = { ...layerToCopy, id: generateId(), name: `${layerToCopy.name} (Copy)` };
    const newLayers = [...state.layers, newLayer];
    const newDuration = Math.max(0, ...newLayers.map(l => l.startAt + l.duration));
    set({
      layers: newLayers,
      selectedLayerId: newLayer.id,
      duration: Math.max(0, ...newLayers.map(l => l.startAt + l.duration))
    });
  },

  splitLayer: (id, splitTime) => {
    get().takeSnapshot();
    const state = get();
    const layer = state.layers.find(l => l.id === id);
    if (!layer || splitTime <= layer.startAt || splitTime >= layer.startAt + layer.duration) return;

    const firstHalfDuration = splitTime - layer.startAt;
    const secondHalfDuration = layer.duration - firstHalfDuration;

    // Use a unique ID for the new layer
    const newLayerId = generateId();

    const newLayer: Layer = {
      ...layer,
      id: newLayerId,
      startAt: splitTime,
      duration: secondHalfDuration,
      trimStart: (layer.trimStart || 0) + firstHalfDuration
    };

    const newLayers = state.layers.map(l => l.id === id ? { ...l, duration: firstHalfDuration } : l).concat(newLayer);

    set({
      layers: newLayers,
      selectedLayerId: newLayerId,
      duration: Math.max(0, ...newLayers.map(l => l.startAt + l.duration))
    });
  },

  moveLayerTrack: (id, trackId) => {
    get().takeSnapshot();
    set((state) => ({
      layers: state.layers.map(layer => layer.id === id ? { ...layer, track: trackId } : layer)
    }));
  },

  addTrack: (name) => {
    get().takeSnapshot();
    const trackId = generateId();
    set(state => ({
      tracks: [{ id: trackId, name: name || `Track ${state.tracks.length + 1}`, isLocked: false, isVisible: true, isMuted: false, volume: 1 }, ...state.tracks]
    }));
    return trackId;
  },

  deleteTrack: (trackId) => {
    get().takeSnapshot();
    set(state => ({
      tracks: state.tracks.filter(t => t.id !== trackId),
      layers: state.layers.filter(l => l.track !== trackId)
    }));
  },

  reorderTracks: (startIndex, endIndex) => {
    get().takeSnapshot();
    set(state => {
      const result = Array.from(state.tracks);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { tracks: result };
    });
  },

  toggleTrackProperty: (trackId, property) => {
    get().takeSnapshot();
    set((state) => ({
      tracks: state.tracks.map(t => t.id === trackId ? { ...t, [property]: !t[property] } : t)
    }));
  },

  updateTrack: (trackId, updates) => {
    get().takeSnapshot();
    set((state) => ({
      tracks: state.tracks.map(t => t.id === trackId ? { ...t, ...updates } : t)
    }));
  }
}));
