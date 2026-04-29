import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Metadata } from "next";
import { Calendar, User, Clock, ArrowRight, Sparkles, Zap, Brain } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | SH Lumen - AI Video Generation & Editing Insights",
  description: "Explore the latest in AI video technology, creative editing tips, and industry insights on the SH Lumen blog.",
  keywords: ["AI Video", "Video Editing", "Creative Technology", "SH Lumen Blog", "AI Generation"],
};

const blogPosts = [
  {
    id: 1,
    title: "The Future of AI in Cinematic Storytelling",
    excerpt: "Discover how generative AI is transforming the way creators approach narrative structure and visual effects.",
    category: "Industry Trends",
    author: "Alex Rivera",
    date: "April 24, 2026",
    readTime: "6 min read",
    icon: <Brain className="text-purple-400" />,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop",
    slug: "future-of-ai-cinematic-storytelling"
  },
  {
    id: 2,
    title: "5 Tips for Mastering the Pro Video Editor",
    excerpt: "Unlock the full potential of your editing workflow with these expert techniques and keyboard shortcuts.",
    category: "Tutorials",
    author: "Sarah Chen",
    date: "April 22, 2026",
    readTime: "4 min read",
    icon: <Zap className="text-yellow-400" />,
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=800&auto=format&fit=crop",
    slug: "mastering-pro-video-editor"
  },
  {
    id: 3,
    title: "Text-to-Video: From Prompt to Masterpiece",
    excerpt: "A deep dive into crafting effective prompts that result in stunning, high-quality AI-generated videos.",
    category: "AI Insights",
    author: "James Wilson",
    date: "April 20, 2026",
    readTime: "8 min read",
    icon: <Sparkles className="text-blue-400" />,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    slug: "text-to-video-prompt-guide"
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-white flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <header className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Creative <span className="gradient-text">Insights</span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto leading-relaxed">
            Stay updated with the latest advancements in AI-powered video creation, 
            pro editing techniques, and the future of digital storytelling.
          </p>
        </header>

        {/* Featured Post */}
        <section className="mb-20">
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 aspect-[21/9] flex items-end p-8 md:p-12 hover:border-[var(--accent)]/50 transition-all duration-500">
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1600&auto=format&fit=crop" 
                alt="Featured Post" 
                className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>
            
            <div className="relative z-10 max-w-3xl">
              <span className="px-3 py-1 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-bold uppercase tracking-widest mb-4 inline-block">
                Featured Article
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 group-hover:text-[var(--accent)] transition-colors">
                The Rise of Neural Video Processing in 2026
              </h2>
              <p className="text-[var(--text-muted)] text-lg mb-6 line-clamp-2 md:line-clamp-none">
                Exploring how new neural architectures are enabling real-time video generation with unprecedented temporal consistency and resolution.
              </p>
              <Link href="/blog/neural-video-processing" className="flex items-center gap-2 font-bold group/btn">
                Read Article <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, idx) => (
            <article 
              key={post.id} 
              className="group flex flex-col rounded-3xl border border-white/5 bg-white/5 overflow-hidden hover:border-[var(--accent)]/30 hover:bg-white/10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${(idx + 1) * 100}ms` }}
            >
              <div className="aspect-[16/10] overflow-hidden relative">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                />
                <div className="absolute top-4 left-4 p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
                  {post.icon}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-4 mb-4 text-[10px] uppercase tracking-widest font-bold text-[var(--text-muted)]">
                  <span>{post.category}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span>{post.readTime}</span>
                </div>
                
                <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-[var(--accent)] transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                      {post.author[0]}
                    </div>
                    <span className="text-xs font-medium text-white/80">{post.author}</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] font-medium">{post.date}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Section */}
        <section className="mt-32 p-12 rounded-[3rem] bg-gradient-to-br from-[var(--accent)]/10 via-transparent to-transparent border border-[var(--accent)]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)]/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-bold mb-2">Subscribe to our newsletter</h2>
              <p className="text-[var(--text-muted)]">Get the latest AI video news delivered to your inbox.</p>
            </div>
            
            <div className="flex w-full md:w-auto gap-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-[var(--bg-dark)] border border-white/10 rounded-2xl px-6 py-4 flex-1 md:w-80 outline-none focus:border-[var(--accent)] transition-all"
              />
              <button className="px-8 py-4 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] font-bold transition-all shadow-lg shadow-[var(--accent-glow)] whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
