"use client";

import React, { useState, useEffect } from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/login/actions";
import { User } from "@supabase/supabase-js";

export default function UserNav() {
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    await signOut(); // Clear server cookies
    setUser(null);
  };

  if (!user) return null;

  return (
    <div className="relative group flex items-center">
      <button className="flex items-center gap-3 pl-3 pr-1 py-1 rounded-full bg-white/5 border border-white/10 hover:border-[var(--accent)] transition-all cursor-pointer outline-none">
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-[11px] font-bold text-white leading-none">
            {user.user_metadata?.full_name || user.email?.split('@')[0]}
          </span>
          <span className="text-[9px] text-[var(--text-muted)] mt-0.5">Pro Account</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center text-xs font-bold text-white shadow-lg border border-white/10">
          {(user.user_metadata?.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
        </div>
      </button>

      {/* User Dropdown */}
      <div className="absolute top-full right-0 pt-2 opacity-0 translate-y-2 scale-95 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-200 z-[1001]">
        <div className="bg-[var(--bg-panel)] border border-white/10 rounded-xl p-2 w-48 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="px-3 py-2 mb-2 border-b border-white/5">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Account</p>
            <p className="text-xs text-white truncate font-medium mt-1">{user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all text-sm cursor-pointer font-medium"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
  