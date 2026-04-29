"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-6">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold gradient-text">Our Products</h1>
          <p className="text-[var(--text-muted)]">Discover our range of AI tools and editing solutions.</p>
          <div className="mt-12 p-12 rounded-3xl border border-white/5 bg-white/5">
            Coming Soon
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
