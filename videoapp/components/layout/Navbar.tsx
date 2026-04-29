"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FilmIcon, LogIn, ChevronDown, Sparkles, Clapperboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import UserNav from "@/components/auth/UserNav";

const products = [
  {
    title: "AI Video Generator",
    description: "Create cinematic videos from text prompts in seconds.",
    href: "/aivideo",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=400&auto=format&fit=crop"
  },
  {
    title: "Pro Video Editor",
    description: "Powerful timeline editing with real-time effects.",
    href: "/editor",
    icon: Clapperboard,
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=400&auto=format&fit=crop"
  }
];

export default function Navbar() {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass h-16 px-6 md:px-12 flex items-center justify-between border-b border-white/5">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
        <FilmIcon className="text-[var(--accent)]" size={24} />
        <span className="gradient-text">SH Lumen</span>
      </Link>

      <div className="hidden md:flex items-center gap-8 h-full">
        <Link href="/" className="text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors">
          Home
        </Link>
        
        {/* Products Mega Menu Trigger */}
        <div 
          className="relative h-full flex items-center"
          onMouseEnter={() => setIsProductsOpen(true)}
          onMouseLeave={() => setIsProductsOpen(false)}
        >
          <button className="flex items-center gap-1 text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer outline-none">
            Products
            <ChevronDown size={14} className={`transition-transform duration-300 ${isProductsOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Mega Menu Content */}
          <div className={`
            absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[600px] transition-all duration-300 origin-top
            ${isProductsOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'}
          `}>
            <div className="bg-[var(--bg-panel)] border border-white/10 rounded-2xl p-6 grid grid-cols-2 gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {products.map((product) => (
                <Link 
                  key={product.title} 
                  href={product.href}
                  className="group relative flex flex-col gap-4 p-4 rounded-xl hover:bg-white/5 transition-all"
                >
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-white/5 relative">
                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <product.icon className="absolute bottom-3 left-3 text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1 group-hover:text-[var(--accent)] transition-colors">
                      {product.title}
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Link href="/discover" className="text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors">
          Discover
        </Link>
        <Link href="/blog" className="text-sm font-medium text-[var(--text-muted)] hover:text-white transition-colors">
          Blog
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <UserNav />
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold transition-all shadow-[0_0_20px_var(--accent-glow)] btn-shine"
          >
            <LogIn size={16} />
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

