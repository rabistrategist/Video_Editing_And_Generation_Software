"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Clapperboard, ChevronRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[var(--accent)]/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[var(--text-muted)] mb-8 fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
          Next-Gen Video Generation is here
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 fade-in" style={{ animationDelay: '0.1s' }}>
          Bring Your Vision to Life <br />
          <span className="gradient-text">With Powerful AI</span>
        </h1>
        
        <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10 fade-in" style={{ animationDelay: '0.2s' }}>
          The ultimate platform for AI-powered video generation and professional editing. 
          Create, edit, and export stunning content without limits.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in" style={{ animationDelay: '0.3s' }}>
          <Link
            href="/aivideo"
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold transition-all shadow-[0_0_30px_var(--accent-glow)] btn-shine group"
          >
            <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
            Create AI Video
          </Link>
          
          <Link
            href="/editor"
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all group"
          >
            <Clapperboard size={20} className="text-[var(--text-muted)] group-hover:text-white transition-colors" />
            Edit Video
            <ChevronRight size={18} className="text-[var(--text-muted)] group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
      
      {/* Abstract Shape Overlay */}
      <div className="mt-20 max-w-6xl mx-auto rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl fade-in" style={{ animationDelay: '0.4s' }}>
        <img 
          src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop" 
          alt="Platform Preview" 
          className="w-full h-auto opacity-80"
        />
      </div>
    </section>
  );
}
