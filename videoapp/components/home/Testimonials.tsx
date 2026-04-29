"use client";

import React from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Alex Rivera",
    role: "Content Creator",
    text: "SH Lumen has completely transformed my workflow. The AI video generation is scarily good, and the editor is smoother than anything else I've used.",
    avatar: "https://i.pravatar.cc/150?u=alex"
  },
  {
    name: "Sarah Chen",
    role: "Marketing Director",
    text: "We've cut our video production time by 70%. The ability to go from a script to a polished video in minutes is a game changer for our social media presence.",
    avatar: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    name: "Marcus Thorne",
    role: "Freelance Editor",
    text: "I was skeptical about AI, but the level of control SH Lumen gives you is incredible. It doesn't replace me; it makes me 10x faster.",
    avatar: "https://i.pravatar.cc/150?u=marcus"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6 md:px-12 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl font-bold">Loved by <span className="gradient-text">Creators</span></h2>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto">
            Join thousands of professionals who are building the future of content with SH Lumen.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="p-8 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/[0.08] transition-all group">
              <div className="flex gap-1 text-[var(--accent)] mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className="text-lg text-white/80 italic mb-8 leading-relaxed">
                "{t.text}"
              </p>
              <div className="flex items-center gap-4">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-[var(--accent)]/30" />
                <div>
                  <h4 className="font-bold text-white group-hover:text-[var(--accent)] transition-colors">{t.name}</h4>
                  <p className="text-sm text-[var(--text-muted)]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
