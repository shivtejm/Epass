"use client"
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function EventDetails() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [passes, setPasses] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [updatingPassId, setUpdatingPassId] = useState<string | null>(null);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    const { data: eventData } = await supabase
      .from('events').select('*').eq('id', params.id).single();
    if (!eventData || eventData.organizer_id !== user.id) { router.push('/organizer/dashboard'); return; }
    setEvent(eventData);

    const { data: passesData } = await supabase
      .from('passes').select('*').eq('event_id', eventData.id).order('created_at', { ascending: false });
    if (passesData) setPasses(passesData);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [params.id, router]);

  const [emailStatus, setEmailStatus] = useState<{ [key: string]: string }>({});

  const updatePassStatus = async (passId: string, newStatus: 'approved' | 'rejected') => {
    setUpdatingPassId(passId);
    await supabase.from('passes').update({ status: newStatus }).eq('id', passId);
    setPasses(prev => prev.map(p => p.id === passId ? { ...p, status: newStatus } : p));

    // Send email pass to attendee when approved
    if (newStatus === 'approved') {
      setEmailStatus(prev => ({ ...prev, [passId]: 'sending' }));
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/send-pass`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passId }),
        });
        const result = await res.json();
        if (result.success) {
          setEmailStatus(prev => ({ ...prev, [passId]: 'sent' }));
        } else {
          setEmailStatus(prev => ({ ...prev, [passId]: 'failed' }));
          console.error('Email failed:', result.error);
        }
      } catch (e) {
        setEmailStatus(prev => ({ ...prev, [passId]: 'failed' }));
        console.error('Email error:', e);
      }
    }
    
    setUpdatingPassId(null);
  };

  if (loading) return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!event) return null;

  const eventUrl = typeof window !== 'undefined' ? `${window.location.origin}/event/${event.event_code}` : '';
  const copyToClipboard = () => { navigator.clipboard.writeText(eventUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const filteredPasses = filter === 'all' ? passes : passes.filter(p => p.status === filter);
  const approvedCount = passes.filter(p => p.status === 'approved').length;
  const pendingCount = passes.filter(p => p.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Link href="/organizer/dashboard" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-white mb-8 group transition-colors">
        <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Left: Event Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-600/[0.06] to-transparent rounded-full blur-3xl pointer-events-none" />
             <div className="relative z-10">
               <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
               <p className="text-neutral-400 mb-6 text-sm leading-relaxed">{event.description}</p>
               <div className="grid grid-cols-2 gap-5 mb-6">
                 <div><p className="text-xs text-neutral-600 uppercase tracking-wider mb-1">Date</p><p className="font-medium text-sm">{new Date(event.date).toLocaleString()}</p></div>
                 <div><p className="text-xs text-neutral-600 uppercase tracking-wider mb-1">Location</p><p className="font-medium text-sm">{event.location}</p></div>
                 <div><p className="text-xs text-neutral-600 uppercase tracking-wider mb-1">Price</p><p className="font-medium text-sm">₹{event.price}</p></div>
                 <div><p className="text-xs text-neutral-600 uppercase tracking-wider mb-1">UPI ID</p><p className="font-medium text-sm text-green-400">{event.upi_id}</p></div>
               </div>
               <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex items-center justify-between">
                 <div>
                   <p className="text-xs text-neutral-600 uppercase tracking-wider mb-1">Event Code</p>
                   <p className="text-3xl font-mono font-bold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">{event.event_code}</p>
                 </div>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-3 gap-5">
             <div className="glass-card p-6">
                <p className="text-xs text-neutral-600 uppercase tracking-wider mb-2">Approved</p>
                <p className="text-3xl font-bold text-green-400">{approvedCount}</p>
             </div>
             <div className="glass-card p-6">
                <p className="text-xs text-neutral-600 uppercase tracking-wider mb-2">Pending</p>
                <p className="text-3xl font-bold text-yellow-400">{pendingCount}</p>
             </div>
             <div className="glass-card p-6">
                <p className="text-xs text-neutral-600 uppercase tracking-wider mb-2">Revenue</p>
                <p className="text-3xl font-bold text-green-400">₹{approvedCount * event.price}</p>
             </div>
          </div>
        </div>

        {/* Right: QR & Share */}
        <div className="space-y-6">
          <div className="glass-card p-8 flex flex-col items-center text-center">
            <h3 className="text-lg font-bold mb-1">Share Event</h3>
            <p className="text-sm text-neutral-500 mb-6">Attendees scan this to find your event.</p>
            <div className="bg-white p-5 rounded-2xl mb-6 shadow-2xl shadow-purple-500/10">
              <QRCodeSVG value={eventUrl} size={180} level="M" />
            </div>
            <button onClick={copyToClipboard} className="btn-secondary w-full py-3 flex items-center justify-center gap-2 text-sm">
              {copied ? <span className="text-green-400">✓ Copied!</span> : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy Link</>}
            </button>
          </div>
        </div>
      </div>

      {/* Pass Verification Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Verify Payments
          {pendingCount > 0 && <span className="bg-yellow-500/10 text-yellow-400 text-xs px-2.5 py-1 rounded-full border border-yellow-500/20">{pendingCount} pending</span>}
        </h2>
        <div className="flex gap-2 text-xs">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${filter === f ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/[0.03] text-neutral-500 border border-white/[0.06] hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {filteredPasses.length === 0 ? (
           <div className="p-12 text-center text-neutral-500 text-sm">
             {filter === 'all' ? 'No pass requests yet. Share the QR code or event code to start selling!' : `No ${filter} passes.`}
           </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {filteredPasses.map(p => (
              <div key={p.id} className="p-5 hover:bg-white/[0.02] transition-colors">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white">{p.attendee_name}</h4>
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                        p.status === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                        p.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {p.status.toUpperCase()}
                      </span>
                      {emailStatus[p.id] && (
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                          emailStatus[p.id] === 'sending' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          emailStatus[p.id] === 'sent' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {emailStatus[p.id] === 'sending' ? '📧 Sending...' :
                           emailStatus[p.id] === 'sent' ? '📧 Email Sent' : '📧 Email Failed'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
                      <span>{p.attendee_email}</span>
                      {p.attendee_phone && <span>📱 {p.attendee_phone}</span>}
                      <span className="font-mono text-neutral-400">UTR: {p.utr_number || 'N/A'}</span>
                      <span>Pass: <span className="font-mono text-neutral-400">{p.pass_number}</span></span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">{new Date(p.created_at).toLocaleString()}</p>
                  </div>
                  
                  {p.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => updatePassStatus(p.id, 'approved')} disabled={updatingPassId === p.id}
                        className="bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 px-4 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Approve
                      </button>
                      <button onClick={() => updatePassStatus(p.id, 'rejected')} disabled={updatingPassId === p.id}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-4 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-50 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
