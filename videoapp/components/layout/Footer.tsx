"use client";

import React from "react";
import Link from "next/link";
import { FilmIcon, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-panel)] border-t border-white/5 py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <FilmIcon className="text-[var(--accent)]" size={24} />
            <span className="gradient-text">SH Lumen</span>
          </Link>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Empowering creators with AI-driven video generation and professional editing tools. Create stunning content in seconds.
          </p>
          <div className="flex gap-4">
            {/* Facebook */}
            <a href="#" className="text-[var(--text-muted)] hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            {/* LinkedIn */}
            <a href="#" className="text-[var(--text-muted)] hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            {/* Instagram */}
            <a href="#" className="text-[var(--text-muted)] hover:text-white transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            {/* X (formerly Twitter) */}
            <a href="#" className="text-[var(--text-muted)] hover:text-white transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-6">Product</h4>
          <ul className="space-y-3">
            {["Features", "Pricing", "API", "Templates"].map((item) => (
              <li key={item}>
                <Link href="#" className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-6">Company</h4>
          <ul className="space-y-3">
            {["About", "Blog", "Careers", "Privacy"].map((item) => (
              <li key={item}>
                <Link 
                  href={item === "Blog" ? "/blog" : "#"} 
                  className="text-sm text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-6">Newsletter</h4>
          <p className="text-sm text-[var(--text-muted)] mb-4">Stay updated with the latest AI trends.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter email"
              className="bg-[var(--bg-element)] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)] flex-1"
            />
            <button className="bg-[var(--accent)] p-2 rounded-lg hover:bg-[var(--accent-hover)] transition-colors">
              <Mail size={18} />
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 text-center text-xs text-[var(--text-muted)]">
        © {new Date().getFullYear()} SH Lumen. All rights reserved.
      </div>
    </footer>
  );
}
