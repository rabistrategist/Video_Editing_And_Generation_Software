"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

const cards = [
  {
    title: "Cinematic AI Generation",
    description: "Generate high-fidelity cinematic videos from simple text prompts using our advanced models.",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop",
    tag: "New"
  },
  {
    title: "Pro Video Editor",
    description: "Full-featured timeline editor with layers, transitions, and real-time effects.",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=2070&auto=format&fit=crop",
    tag: "Popular"
  },
  {
    title: "Smart Auto-Captions",
    description: "Automatically generate and sync captions with your video audio in multiple languages.",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop",
    tag: "AI"
  },
  {
    title: "Collaboration Tools",
    description: "Work together with your team in real-time on any video project.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
    tag: "Teams"
  }
];

export default function CardCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const next = () => setActiveIndex((prev) => (prev + 1) % cards.length);
  const prev = () => setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex items-end justify-between mb-12">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold">Featured <span className="gradient-text">Capabilities</span></h2>
          <p className="text-[var(--text-muted)] max-w-lg">
            Explore the powerful tools we've built to help you create content that stands out.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={prev} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all active:scale-95">
            <ChevronLeft size={24} />
          </button>
          <button onClick={next} className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center hover:bg-[var(--accent-hover)] transition-all shadow-[0_0_20px_var(--accent-glow)] active:scale-95">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
      
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-700 ease-in-out" 
          style={{ transform: `translateX(-${activeIndex * (100 / (cards.length > 3 ? 3 : cards.length))}%)` }}
        >
          {cards.map((card, idx) => (
            <div key={idx} className="min-w-full md:min-w-[33.33%] px-3">
              <div className="group relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/5 bg-white/5">
                <img src={card.image} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-end">
                  <span className="inline-block px-3 py-1 rounded-full bg-[var(--accent)] text-[10px] font-bold uppercase tracking-wider mb-4 w-fit">
                    {card.tag}
                  </span>
                  <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                  <p className="text-sm text-white/60 mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {card.description}
                  </p>
                  <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <Play size={20} fill="black" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
