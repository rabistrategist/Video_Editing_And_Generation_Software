"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type LayerType = "video" | "audio" | "image" | "text" | "shape" | "emoji";

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
  track: number;       // z-index logically or timeline row
  isVisible: boolean;
  isLocked: boolean;
  
  // Specific properties depending on type
  content?: string;    // text content, emoji char
  thumbnail?: string;   // optional image to display on block
  url?: string;         // public path or blob URL for rendering actual media
  
  // Text Specific
  font?: string;
  fontSize?: number;
  color?: string;

  transform: TransformProps;
}

interface EditorState {
  currentTime: number;
  isPlaying: boolean;
  duration: number;
  zoom: number; // pixels per second for timeline scale
  selectedLayerId: string | null;
  canvas: {
    width: number;
    height: number;
    aspectRatio: string;
    backgroundColor: string;
  };
  layers: Layer[];
}

interface EditorContextType extends EditorState {
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  setIsPlaying: (isPlaying: boolean) => void;
  setDuration: (dur: number) => void;
  setZoom: (zoom: number) => void;
  setSelectedLayerId: (id: string | null) => void;
  setCanvasSettings: (settings: Partial<EditorState["canvas"]>) => void;
  
  addLayer: (layer: Omit<Layer, "id">) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  splitLayer: (id: string, splitAt: number) => void;
  moveLayerTrack: (id: string, newTrack: number) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(30); // Default project duration 30s
  const [zoom, setZoom] = useState(10); // px per second
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  
  const [canvas, setCanvas] = useState({
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    backgroundColor: "#1a1a1a"
  });

  const [layers, setLayers] = useState<Layer[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const setCanvasSettings = (settings: Partial<EditorState["canvas"]>) => {
    setCanvas((prev) => ({ ...prev, ...settings }));
  };

  const addLayer = (layer: Omit<Layer, "id">) => {
    const newLayer = { ...layer, id: generateId() };
    setLayers((prev) => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers((prev) => 
      prev.map(layer => layer.id === id ? { ...layer, ...updates } : layer)
    );
  };

  const deleteLayer = (id: string) => {
    setLayers((prev) => prev.filter(layer => layer.id !== id));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const duplicateLayer = (id: string) => {
    const layerToCopy = layers.find(l => l.id === id);
    if (!layerToCopy) return;
    addLayer({ ...layerToCopy, name: `${layerToCopy.name} (Copy)` });
  };

  const splitLayer = (id: string, splitTime: number) => {
    const layer = layers.find(l => l.id === id);
    if (!layer || splitTime <= layer.startAt || splitTime >= layer.startAt + layer.duration) return;

    const firstHalfDuration = splitTime - layer.startAt;
    const secondHalfDuration = layer.duration - firstHalfDuration;

    // Update existing to first half
    updateLayer(id, { duration: firstHalfDuration });
    
    // Add new for second half
    addLayer({
      ...layer,
      startAt: splitTime,
      duration: secondHalfDuration
    });
  };

  const moveLayerTrack = (id: string, track: number) => {
    updateLayer(id, { track });
  };

  const value = {
    currentTime, setCurrentTime,
    isPlaying, setIsPlaying,
    duration, setDuration,
    zoom, setZoom,
    selectedLayerId, setSelectedLayerId,
    canvas, setCanvasSettings,
    layers, addLayer, updateLayer, deleteLayer, duplicateLayer, splitLayer, moveLayerTrack
  };

  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}
