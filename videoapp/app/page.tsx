"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import LogoSlider from "@/components/home/LogoSlider";
import CardCarousel from "@/components/home/CardCarousel";
import Testimonials from "@/components/home/Testimonials";
import FAQSection from "@/components/home/FAQSection";
import FeedbackSection from "@/components/home/FeedbackSection";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)]">
      <Navbar />
      
      <main>
        <Hero />
        <LogoSlider />
        <CardCarousel />
        
        {/* Call to Action Section */}
        <section className="py-24 px-6 md:px-12">
          <div className="max-w-5xl mx-auto p-12 rounded-[3rem] bg-gradient-to-br from-[var(--accent)] to-[#6d28d9] relative overflow-hidden shadow-2xl">
            {/* Abstract Shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10 text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Ready to create your first <br /> AI-powered video?
              </h2>
              <p className="text-white/80 text-lg max-w-2xl mx-auto font-medium">
                Join our community of over 50,000 creators and start building high-quality video content today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-[var(--accent)] font-bold text-lg hover:bg-white/90 transition-all shadow-xl active:scale-95">
                  Get Started for Free
                </button>
                <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-black/20 text-white font-bold text-lg hover:bg-black/30 transition-all border border-white/20 active:scale-95">
                  View Pricing
                </button>
              </div>
            </div>
          </div>
        </section>

        <Testimonials />
        <FAQSection />
        <FeedbackSection />
      </main>

      <Footer />
    </div>
  );
}
