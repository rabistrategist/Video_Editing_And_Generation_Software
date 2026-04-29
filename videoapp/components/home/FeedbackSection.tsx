"use client";

import React, { useState, useTransition } from "react";
import { Send, Mail, User, MessageSquare, Loader2, CheckCircle } from "lucide-react";
import { sendFeedback } from "@/app/actions/feedback";

export default function FeedbackSection() {
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await sendFeedback(formData);
      if (result.success) {
        setIsSubmitted(true);
      }
    });
  };

  return (
    <section className="py-24 px-6 md:px-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[var(--accent)]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm font-bold mb-4">
              <MessageSquare size={16} />
              We value your input
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
              Share Your <span className="gradient-text">Feedback</span> <br /> 
              With Our Team
            </h2>
          </div>
          
          <p className="text-lg text-[var(--text-muted)] leading-relaxed max-w-md">
            Help us shape the future of SH Lumen. Whether it&apos;s a feature request, 
            a bug report, or just a friendly hello, we&apos;re all ears.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 w-fit">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest">Support Email</p>
                <p className="text-white font-medium">Contact@strategisthub.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          {/* Form Card */}
          <div className="p-8 md:p-10 rounded-[2.5rem] bg-[var(--bg-panel)] border border-white/10 shadow-2xl relative z-10">
            {isSubmitted ? (
              <div className="py-20 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white">Feedback Received!</h3>
                <p className="text-[var(--text-muted)]">
                  Thank you for helping us improve. Our team will review your message soon.
                </p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-[var(--accent)] font-bold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form action={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/70 ml-2">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    <input 
                      name="name"
                      type="text" 
                      required
                      placeholder="John Doe"
                      className="w-full bg-[var(--bg-dark)] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--accent)] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/70 ml-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                    <input 
                      name="email"
                      type="email" 
                      required
                      placeholder="john@example.com"
                      className="w-full bg-[var(--bg-dark)] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--accent)] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/70 ml-2">Your Message</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 text-[var(--text-muted)]" size={18} />
                    <textarea 
                      name="message"
                      required
                      placeholder="Tell us what's on your mind..."
                      rows={4}
                      className="w-full bg-[var(--bg-dark)] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--accent)] transition-all resize-none"
                    />
                  </div>
                </div>

                <button 
                  disabled={isPending}
                  className="w-full py-4 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold transition-all shadow-lg shadow-[var(--accent-glow)] flex items-center justify-center gap-3 disabled:opacity-50 group"
                >
                  {isPending ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      Send Feedback
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Decorative Elements */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[var(--accent)]/20 blur-3xl rounded-full -z-0" />
          <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#6d28d9]/20 blur-3xl rounded-full -z-0" />
        </div>
      </div>
    </section>
  );
}
