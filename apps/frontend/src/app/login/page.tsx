"use client"
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        router.push('/organizer/dashboard');
      }
    });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/organizer/dashboard');
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        {/* Logo with Trust Seal */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-2xl blur-xl opacity-40" />
            <div className="relative bg-gradient-to-tr from-purple-500 to-blue-500 rounded-2xl w-16 h-16 flex items-center justify-center shadow-2xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex justify-center mb-6">
          <div className="security-badge">
            <svg className="lock-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure Login</span>
          </div>
        </div>

        {/* Card with Premium Border */}
        <div className="premium-card p-8">
          <h2 className="text-2xl font-bold text-center mb-1">Welcome back</h2>
          <p className="text-neutral-500 text-center mb-8 text-sm">Sign in to manage your events and passes</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6 flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-[52px] bg-white text-black font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-neutral-100 transition-all mb-6 shadow-sm border border-neutral-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-white/[0.06]" />
            <span className="px-4 text-xs text-neutral-600 uppercase tracking-wider">or sign in with email</span>
            <div className="flex-1 border-t border-white/[0.06]" />
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Email address</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2 flex items-center justify-between">
                <span>Password</span>
                <span className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer transition-colors">Forgot password?</span>
              </label>
              <div className="relative">
                <input
                  type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-12"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="btn-primary w-full h-[52px] flex items-center justify-center text-base disabled:opacity-50 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Security Indicators */}
          <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-white/[0.06]">
            <div className="encryption-badge text-[10px]">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Encrypted</span>
            </div>
            <div className="secure-connection text-xs">
              <span>Secure</span>
            </div>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-white/[0.06]" />
            <span className="px-4 text-xs text-neutral-600 uppercase tracking-wider">or</span>
            <div className="flex-1 border-t border-white/[0.06]" />
          </div>

          <p className="text-center text-sm text-neutral-500">
            Don't have an account?{' '}
            <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
