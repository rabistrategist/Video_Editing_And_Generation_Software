"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How does the AI Video Generator work?",
    answer: "Our AI uses advanced diffusion models to transform your text prompts into high-quality cinematic videos. Simply describe the scene, and our engine handles the rendering, lighting, and movement automatically."
  },
  {
    question: "Is the Pro Video Editor suitable for beginners?",
    answer: "Yes! While it packs professional-grade tools like timeline editing and real-time effects, the interface is designed to be intuitive. We provide templates and a 'floating command center' to guide you."
  },
  {
    question: "What video formats are supported for export?",
    answer: "You can export your masterpieces in high-definition MP4, MOV, and AVI formats. We also support different aspect ratios optimized for social media like TikTok, Instagram, and YouTube."
  },
  {
    question: "Can I use my own assets in the editor?",
    answer: "Absolutely. You can upload your own videos, images, and audio files. You can even mix your existing footage with AI-generated clips for a truly unique creation."
  },
  {
    question: "What are the limits on the free plan?",
    answer: "The free plan allows you to generate up to 5 AI videos per month and use all basic editing tools. For higher resolution, unlimited generations, and premium effects, check out our Pro Account."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 px-6 md:px-12 bg-black/20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-bold mb-4">
            <HelpCircle size={16} />
            Common Questions
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className={`rounded-2xl border transition-all duration-300 ${
                openIndex === idx ? 'bg-white/5 border-[var(--accent)]/50 shadow-[0_0_30px_var(--accent-glow)]' : 'bg-transparent border-white/5 hover:border-white/10'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="text-lg font-semibold text-white/90">{faq.question}</span>
                <ChevronDown 
                  size={20} 
                  className={`text-[var(--text-muted)] transition-transform duration-300 ${openIndex === idx ? 'rotate-180 text-[var(--accent)]' : ''}`} 
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6 pt-0 text-[var(--text-muted)] leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
