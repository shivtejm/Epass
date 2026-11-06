"use client"
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OrganizerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [myPasses, setMyPasses] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'events' | 'passes'>('events');

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      // Fetch organizer's events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false });
      if (eventsData) setEvents(eventsData);

      // Fetch user's purchased passes (as attendee)
      const { data: passesData } = await supabase
        .from('passes')
        .select('*, events(title, date, location, event_code, price)')
        .eq('attendee_id', user.id)
        .order('created_at', { ascending: false });
      if (passesData) setMyPasses(passesData);

      setLoading(false);
    };
    fetchData();
  }, [router]);

  if (loading) return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header with Trust Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="security-badge text-xs py-1.5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Secure</span>
            </div>
          </div>
          <p className="text-neutral-500 mt-1 text-sm">Manage your events and track your passes.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/organizer/events/new" className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2 group">
            <svg className="w-4 h-4 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span>Create Event</span>
          </Link>
        </div>
      </div>

      {/* Clickable Tab Cards with Premium Styling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
        <button onClick={() => setActiveTab('events')} className={`premium-card p-6 text-left transition-all duration-300 ${activeTab === 'events' ? 'border-purple-500/40 bg-purple-500/[0.04] shadow-[0_0_30px_-10px_rgba(168,85,247,0.15)]' : 'hover:border-white/[0.12]'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeTab === 'events' ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-500/10 text-purple-400'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <span className={`text-sm font-medium ${activeTab === 'events' ? 'text-purple-300' : 'text-neutral-400'}`}>My Events</span>
            </div>
            {activeTab === 'events' && (
              <div className="verified-badge text-[10px]">
                Active
              </div>
            )}
          </div>
          <p className="text-4xl font-bold">{events.length}</p>
          <p className="text-xs text-neutral-500 mt-2">Events created</p>
        </button>

        <button onClick={() => setActiveTab('passes')} className={`premium-card p-6 text-left transition-all duration-300 ${activeTab === 'passes' ? 'border-blue-500/40 bg-blue-500/[0.04] shadow-[0_0_30px_-10px_rgba(59,130,246,0.15)]' : 'hover:border-white/[0.12]'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${activeTab === 'passes' ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-500/10 text-blue-400'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
              </div>
              <span className={`text-sm font-medium ${activeTab === 'passes' ? 'text-blue-300' : 'text-neutral-400'}`}>My Passes</span>
              {myPasses.length > 0 && <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full">{myPasses.length}</span>}
            </div>
            {activeTab === 'passes' && (
              <div className="verified-badge text-[10px]">
                Active
              </div>
            )}
          </div>
          <p className="text-4xl font-bold">{myPasses.length}</p>
          <p className="text-xs text-neutral-500 mt-2">Passes purchased</p>
        </button>
      </div>

      {/* Tab: Your Events */}
      {activeTab === 'events' && (
        <>
          {events.length === 0 ? (
            <div className="premium-card p-16 text-center border-dashed">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No events yet</h3>
              <p className="text-neutral-500 mb-8 max-w-sm mx-auto text-sm">Create your first event to generate a shareable code and start selling digital passes.</p>
              <Link href="/organizer/events/new" className="btn-primary inline-flex items-center gap-2 px-6 py-3 group">
                <span>Create Your First Event</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((event) => (
                <Link href={`/organizer/events/${event.id}`} key={event.id} className="premium-card p-6 hover:border-purple-500/30 transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-purple-600/[0.05] to-transparent rounded-full blur-2xl group-hover:from-purple-600/[0.1] transition-all" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold line-clamp-1 text-white group-hover:text-purple-400 transition-colors">{event.title}</h3>
                      <span className="bg-white/[0.05] border border-white/[0.08] text-xs px-2.5 py-1 rounded-lg text-neutral-400 font-mono shrink-0 ml-2">{event.event_code}</span>
                    </div>
                    <p className="text-neutral-500 text-sm mb-6 line-clamp-2">{event.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-white">₹{event.price}</span>
                      <span className="text-purple-400 flex items-center gap-1 group-hover:gap-2 transition-all font-medium">
                        Manage
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: My Passes */}
      {activeTab === 'passes' && (
        <>
          {myPasses.length === 0 ? (
            <div className="glass-card p-16 text-center border-dashed">
              <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No passes yet</h3>
              <p className="text-neutral-500 mb-8 max-w-sm mx-auto text-sm">When you purchase passes for events, they'll appear here with your QR codes.</p>
              <Link href="/" className="btn-primary inline-flex items-center gap-2 px-6 py-3">
                <span>Browse Events</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myPasses.map((pass) => {
                const isUsed = pass.checked_in === true;
                const isApproved = pass.status === 'approved';
                const isPending = pass.status === 'pending';

                return (
                  <div key={pass.id} className="glass-card relative overflow-hidden group hover:border-white/[0.12] transition-all duration-300">
                    {/* USED / VALID Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                      <span
                        className={`text-6xl font-black uppercase tracking-[0.2em] select-none transform -rotate-[25deg] ${isUsed
                          ? 'text-red-500/[0.12]'
                          : isApproved
                            ? 'text-green-500/[0.10]'
                            : 'text-yellow-500/[0.10]'
                          }`}
                      >
                        {isUsed ? 'USED' : isApproved ? 'VALID' : 'PENDING'}
                      </span>
                    </div>

                    {/* Pass Content */}
                    <div className="relative z-10">
                      {/* Top Bar - Event Info */}
                      <div className={`px-6 py-4 border-b border-white/[0.06] ${isUsed ? 'opacity-50' : ''}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-bold text-white text-base line-clamp-1">{pass.events?.title || 'Event'}</h3>
                            <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              {pass.events?.date ? new Date(pass.events.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </p>
                            {pass.events?.location && (
                              <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                {pass.events.location}
                              </p>
                            )}
                          </div>
                          {/* Status Badge */}
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg border shrink-0 ${isUsed
                            ? 'text-red-400 bg-red-500/10 border-red-500/20'
                            : isApproved
                              ? 'text-green-400 bg-green-500/10 border-green-500/20'
                              : isPending
                                ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                                : 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20'
                            }`}>
                            {isUsed ? '✓ Used' : isApproved ? '✓ Valid' : isPending ? '⏳ Pending' : pass.status}
                          </span>
                        </div>
                      </div>

                      {/* Ticket Tear Line */}
                      <div className="relative">
                        <div className="absolute left-0 top-0 w-4 h-4 bg-[#050505] rounded-full -translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute right-0 top-0 w-4 h-4 bg-[#050505] rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="border-t border-dashed border-white/[0.06]" />
                      </div>

                      {/* Pass Details */}
                      <div className={`px-6 py-5 space-y-3 ${isUsed ? 'opacity-50' : ''}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-neutral-600 uppercase tracking-widest">Pass No.</span>
                          <span className="font-mono text-sm text-white font-medium">{pass.pass_number}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-neutral-600 uppercase tracking-widest">Attendee</span>
                          <span className="text-sm text-neutral-300">{pass.attendee_name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-neutral-600 uppercase tracking-widest">Price</span>
                          <span className="text-sm text-neutral-300 font-medium">{pass.events?.price > 0 ? `₹${pass.events.price}` : 'Free'}</span>
                        </div>
                        {isUsed && pass.checked_in_at && (
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-neutral-600 uppercase tracking-widest">Used At</span>
                            <span className="text-sm text-red-400">{new Date(pass.checked_in_at).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
