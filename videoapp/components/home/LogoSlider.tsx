"use client";

import React from "react";

const logos = [
  "NVIDIA", "Adobe", "OpenAI", "Meta", "Google", "Disney", "Netflix", "Sony"
];

export default function LogoSlider() {
  return (
    <section className="px-40 py-20 border-y border-white/10 bg-black/20 overflow-hidden">
      <div className="text-center mb-10">
        <p className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-widest">
          Trusted by industry leaders
        </p>
      </div>
      
      <div className="relative flex overflow-hidden">
        <div className="flex animate-scroll whitespace-nowrap">
          {[...logos, ...logos].map((logo, idx) => (
            <div key={idx} 
                 className="mx-12 text-3xl font-bold text-white/40
                            hover:text-white/80 transition-colors 
                            select-none cursor-pointer">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
