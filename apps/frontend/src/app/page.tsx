"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Trust Badge Component
function HeroTrustBadge() {
  return (
    <div className="relative inline-flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-full px-5 py-2.5 mb-8 text-sm text-neutral-300 backdrop-blur-sm hover:border-green-500/30 transition-colors">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-green-400 font-medium">Trusted</span>
      </div>
      <span className="text-neutral-500">by</span>
      <span className="text-white font-semibold">500+ event organizers</span>
      <div className="ml-2 flex items-center gap-1">
        <span className="verified-badge text-[10px] py-1">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Verified
        </span>
      </div>
    </div>
  );
}

// Security Feature Card
function SecurityFeatureCard({ icon, title, description, glowColor }: { icon: string, title: string, description: string, glowColor: string }) {
  return (
    <div className={`glass-card p-6 hover:border-white/[0.12] transition-all duration-300 group cursor-default relative overflow-hidden ${glowColor}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
        <p className="text-sm text-neutral-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [eventCode, setEventCode] = useState('');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    import('@/lib/supabase').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
        setUser(session?.user ?? null);
      });
      return () => subscription.unsubscribe();
    });
  }, []);

  const handleFindEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventCode.trim().length > 0) {
      router.push(`/event/${eventCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="flex flex-col">

      {/* ===== HERO SECTION ===== */}
      <section className="relative flex flex-col items-center justify-center min-h-[85vh] px-6 py-20 text-center overflow-hidden">

        {/* Radial glow behind heading */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-purple-600/20 via-blue-600/10 to-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Floating shield animation */}
        <div className="absolute top-[15%] right-[10%] w-20 h-20 opacity-20 float-shield hidden lg:block">
          <svg viewBox="0 0 24 24" fill="url(#shieldGrad)" className="w-full h-full">
            <defs>
              <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        {/* Badge with Trust Indicators */}
        <HeroTrustBadge />

        {/* Main Heading with Premium Effects */}
        <h1 className="relative text-5xl sm:text-6xl md:text-[80px] font-extrabold leading-[1.05] tracking-tight max-w-4xl">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-neutral-500">
            Events made
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 glow-text">
            effortless.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="relative text-lg md:text-xl text-neutral-400 max-w-2xl mt-6 leading-relaxed">
          Create stunning digital passes, accept secure payments, and deliver instant QR tickets via email &amp; WhatsApp — all in one platform.
        </p>

        {/* Security Trust Indicators */}
        <div className="relative flex flex-wrap items-center justify-center gap-4 mt-8">
          <div className="security-badge">
            <svg className="lock-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Bank-Level Encryption</span>
          </div>
          <div className="encryption-badge">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Stripe Secure</span>
          </div>
        </div>

        {/* CTA Buttons with Premium Styling */}
        <div className="relative flex flex-col sm:flex-row items-center gap-4 mt-10">
          <Link href={user ? "/organizer/dashboard" : "/signup"} className="btn-primary flex items-center gap-2 text-base px-8 py-4 shadow-lg shadow-purple-500/20 group">
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            <span>{user ? "Go to Dashboard" : "Start Hosting Free"}</span>
          </Link>
          <Link href="#find-event" className="btn-secondary text-base px-8 py-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <span>Join an Event</span>
          </Link>
        </div>

        {/* Stats Row with Enhanced Cards */}
        <div className="relative flex flex-wrap items-center justify-center gap-6 mt-16 pt-8 border-t border-white/[0.06]">
          {[
            { label: 'Events Created', value: '2,500+', icon: '🎉', color: 'from-purple-500/20 to-purple-500/5' },
            { label: 'Passes Sold', value: '45,000+', icon: '🎫', color: 'from-blue-500/20 to-blue-500/5' },
            { label: 'Secure Payments', value: '100%', icon: '🔒', color: 'from-green-500/20 to-green-500/5' },
          ].map((stat) => (
            <div key={stat.label} className={`stats-card text-center px-8 py-4 bg-gradient-to-br ${stat.color}`}>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-xs text-neutral-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FIND EVENT SECTION ===== */}
      <section id="find-event" className="relative py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Premium Card */}
          <div className="premium-card p-10">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Already have a code?
            </h2>
            <p className="text-neutral-400 mb-8">Enter the 6-digit event code shared by the organizer to instantly find and purchase your pass.</p>

            <form onSubmit={handleFindEvent} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                  placeholder="Enter event code"
                  maxLength={6}
                  className="input-field text-center text-xl tracking-[0.3em] font-mono font-bold uppercase h-[56px] placeholder:tracking-normal placeholder:text-sm placeholder:font-normal"
                />
              </div>
              <button type="submit" className="btn-primary h-[56px] px-8 whitespace-nowrap flex items-center gap-2">
                <span>Find Event</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>

            {/* Security indicator */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-white/[0.06]">
              <div className="secure-connection text-xs">
                <span>Secure Lookup</span>
              </div>
              <div className="encryption-badge text-[10px]">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>SSL Protected</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Why Choose EPass
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Enterprise-Grade Security</h2>
            <p className="text-neutral-400 max-w-lg mx-auto">Everything you need to host and manage world-class events with complete peace of mind.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Bank-Grade Security',
                desc: 'Card details are handled exclusively by Stripe. No sensitive data ever touches our servers.',
                color: 'text-green-400',
                bg: 'bg-green-500/10',
                border: 'border-green-500/20'
              },
              {
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'Instant QR Passes',
                desc: 'Attendees receive unique QR passes via Email and WhatsApp within seconds of purchase.',
                color: 'text-purple-400',
                bg: 'bg-purple-500/10',
                border: 'border-purple-500/20'
              },
              {
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Low Platform Fee',
                desc: 'Just 1% per transaction. Funds route directly to organizer\'s bank account via Stripe Connect.',
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20'
              },
              {
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Scan or Type to Join',
                desc: 'Share a QR code or a 6-digit event code. Attendees can join from any device instantly.',
                color: 'text-cyan-400',
                bg: 'bg-cyan-500/10',
                border: 'border-cyan-500/20'
              },
              {
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Real-time Dashboard',
                desc: 'Track sales, revenue, and attendee data in real-time from your organizer dashboard.',
                color: 'text-blue-400',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20'
              },
              {
                icon: (
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                ),
                title: 'Premium Experience',
                desc: 'Beautiful digital passes with unique numbers that attendees can proudly show at entry.',
                color: 'text-pink-400',
                bg: 'bg-pink-500/10',
                border: 'border-pink-500/20'
              },
            ].map((feature) => (
              <div key={feature.title} className={`glass-card p-8 hover:border-white/[0.12] transition-all duration-300 group cursor-default border ${feature.border} bg-black/40`}>
                <div className={`w-14 h-14 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center premium-card p-12 glow-purple relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 pointer-events-none" />

          {/* Floating elements */}
          <div className="absolute top-10 left-10 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Join 500+ event organizers
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-4">Ready to host your event?</h2>
            <p className="text-neutral-400 mb-8 max-w-lg mx-auto">Join hundreds of organizers using EPass to sell tickets and manage attendees effortlessly.</p>

            <Link href={user ? "/organizer/dashboard" : "/signup"} className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2 shadow-lg shadow-purple-500/25 group">
              <span>{user ? "Go to Dashboard" : "Create Free Account"}</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>

            {/* Security indicators */}
            <div className="flex items-center justify-center gap-6 mt-8 pt-8 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Secure & Verified</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Stripe Protected</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
