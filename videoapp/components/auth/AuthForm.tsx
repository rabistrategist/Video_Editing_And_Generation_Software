"use client";

import React, { useState, useTransition, useEffect } from "react";
import { Mail, Lock, User, ArrowRight, Code, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { login, signup } from "@/app/login/actions";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

export default function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const successMessage = searchParams.get("success");

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = mode === "login" ? await login(formData) : await signup(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-3xl border border-white/5 bg-[var(--bg-panel)] shadow-2xl relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--accent)]/20 blur-[80px] rounded-full" />
      
      <div className="relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-[var(--text-muted)] text-sm">
            {mode === "login" 
              ? "Login to access your projects and AI tools." 
              : "Join SH Lumen and start creating with AI."}
          </p>
        </div>

        {successMessage && !error && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-1">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                required
                className="w-full bg-[var(--bg-dark)] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              required
              className="w-full bg-[var(--bg-dark)] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--accent)] transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              className="w-full bg-[var(--bg-dark)] border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white focus:outline-none focus:border-[var(--accent)] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button 
            disabled={isPending}
            className="w-full py-4 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold transition-all shadow-[0_0_20px_var(--accent-glow)] btn-shine flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Login" : "Create Account"}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="my-8 flex items-center gap-4 text-[var(--text-muted)] text-xs uppercase tracking-widest font-bold">
          <div className="h-px bg-white/5 flex-1" />
          Or continue with
          <div className="h-px bg-white/5 flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button 
            type="button"
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-medium"
          >
            <Code size={18} />
            Github
          </button>
          <button 
            type="button"
            onClick={() => {
              const supabase = createClient();
              supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback`,
                  queryParams: {
                    prompt: 'select_account',
                  },
                },
              });
            }}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-medium group"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0" alt="" />
            Google
          </button>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)]">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-[var(--accent)] font-bold hover:underline"
          >
            {mode === "login" ? "Create one" : "Login here"}
          </button>
        </p>
      </div>
    </div>
  );
}

