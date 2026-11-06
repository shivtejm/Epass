"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center gap-2 h-10"></div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
          Home
        </Link>
        <Link href="/organizer/dashboard" className="text-sm font-medium text-white/80 hover:text-white transition-colors">
          Dashboard
        </Link>
        <button 
          onClick={() => {
            if (window.confirm("Are you sure you want to sign out?")) {
              supabase.auth.signOut();
            }
          }}
          className="text-sm font-medium text-white/50 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors px-4 py-2.5 rounded-xl hover:bg-white/[0.04]">
        Log in
      </Link>
      <Link href="/signup" className="text-sm font-semibold bg-white text-black px-5 py-2.5 rounded-xl hover:bg-neutral-100 transition-all shadow-sm">
        Get Started
      </Link>
    </div>
  );
}
