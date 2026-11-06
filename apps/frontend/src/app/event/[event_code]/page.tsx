"use client"
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

export default function EventPublicPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Attendee form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [step, setStep] = useState<'details' | 'pay' | 'utr' | 'done'>('details');
  const [submitting, setSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [passResult, setPassResult] = useState<any>(null);
  const [passCount, setPassCount] = useState(0);

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (val && !isValidEmail(val)) {
      setEmailError('Please enter a valid email address (e.g. you@gmail.com)');
    } else {
      setEmailError(null);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`*, profiles(full_name)`)
        .eq('event_code', params.event_code)
        .single();
      if (error || !data) { setError("Event not found. Please check the code."); }
      else {
        setEvent(data);
        const { count } = await supabase
          .from('passes')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', data.id);
        setPassCount(count || 0);
      }
      setLoading(false);
    };
    fetchEvent();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [params.event_code]);

  const isFreeEvent = event?.price === 0 || event?.price === '0' || event?.price === null;

  const generateUpiLink = () => {
    if (!event) return '';
    return `upi://pay?pa=${event.upi_id}&pn=${encodeURIComponent(event.title)}&am=${event.price}&cu=INR&tn=EPass-${event.event_code}`;
  };

  const submitFreePass = async () => {
    setSubmitting(true);
    const passNumber = `EP-${Math.random().toString(36).substr(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const qrData = `epass_verify:${event.id}:${passNumber}`;
    const { data: { session } } = await supabase.auth.getSession();

    const { data: passData, error: insertError } = await supabase.from('passes').insert({
      event_id: event.id,
      attendee_id: session?.user?.id || null,
      attendee_name: name,
      attendee_email: email,
      attendee_phone: phone || null,
      pass_number: passNumber,
      utr_number: null,
      status: 'approved',
      qr_data: qrData,
    }).select().single();

    if (insertError) {
      alert('Error: ' + insertError.message);
      setSubmitting(false);
      return;
    }

    if (passData) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/send-pass`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passId: passData.id }),
        });
      } catch (e) { console.error('Email error:', e); }
    }

    setPassResult({ status: 'approved', autoApproved: true });
    setStep('done');
    setSubmitting(false);
  };

  const submitPaidPass = async () => {
    setSubmitting(true);
    setSubmitError(null);

    const { data: { session } } = await supabase.auth.getSession();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/submit-pass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        utr_number: utrNumber,
        event_id: event.id,
        attendee_name: name,
        attendee_email: email,
        attendee_phone: phone || null,
        attendee_id: session?.user?.id || null,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      setSubmitError(result.error || 'Something went wrong');
      setSubmitting(false);
      return;
    }

    setPassResult(result);
    setStep('done');
    setSubmitting(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setName(session.user.user_metadata.full_name || session.user.user_metadata.name || '');
        setEmail(session.user.email || '');
      }
    });
  }, []);

  const handleGoogleLogin = async () => {
    localStorage.setItem('auth_return_url', window.location.pathname);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  if (loading) return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 text-3xl">😕</div>
      <h1 className="text-3xl font-bold mb-2">Event Not Found</h1>
      <p className="text-neutral-500 mb-8">{error}</p>
      <Link href="/" className="btn-primary px-6 py-3"><span>Go Home</span></Link>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-72px)]">
      {/* Hero */}
      <div className="w-full h-[40vh] min-h-[280px] relative flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-neutral-950 to-blue-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] float-1" />

        <div className="max-w-5xl mx-auto w-full px-6 py-12 relative z-10">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono text-xs px-3.5 py-1.5 rounded-full mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
            {event.event_code}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">{event.title}</h1>
          <p className="text-neutral-300 flex items-center gap-2 text-sm">
            Organized by <span className="font-semibold text-white">{event.profiles?.full_name || 'Verified Organizer'}</span>
            <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: Event Details */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-bold mb-4">About this event</h2>
              <p className="text-neutral-400 leading-relaxed whitespace-pre-wrap text-[15px]">{event.description}</p>
            </section>
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="glass-card p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm mb-1">Date & Time</h3>
                    <p className="text-xs text-neutral-500">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-xs text-neutral-500">{new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
               </div>
               <div className="glass-card p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-sm mb-1">Location</h3>
                    <p className="text-xs text-neutral-500">{event.location}</p>
                  </div>
               </div>
            </section>
          </div>

          {/* Right: Get Pass Card */}
          <div className="lg:col-span-1">
            <div className="glass-card p-7 sticky top-24 glow-purple text-center">

              {(event.registration_deadline && new Date(event.registration_deadline) < new Date()) ? (
                <div className="py-4 text-center">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-red-300">Registrations Closed</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-6">
                    This event is no longer accepting new registrations. The deadline was <strong className="text-neutral-300">{new Date(event.registration_deadline).toLocaleString()}</strong>.
                  </p>
                  
                  {event.contact_persons && event.contact_persons.length > 0 && (
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 text-left">
                      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Event Support</p>
                      <div className="space-y-4">
                        {event.contact_persons.map((person: any, i: number) => (
                          <div key={i} className="flex flex-col">
                            <span className="text-sm font-medium text-white">{person.name}</span>
                            <span className="text-xs text-neutral-500">{person.phone}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              ) : (event.max_passes && passCount >= event.max_passes) ? (
                <div className="py-4 text-center">
                  <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-orange-300">Registrations Full</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-6">
                    All <strong className="text-neutral-300">{event.max_passes}</strong> spots have been filled for this event.
                  </p>

                  {event.contact_persons && event.contact_persons.length > 0 && (
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 text-left">
                      <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Contact Organizers</p>
                      <div className="space-y-4">
                        {event.contact_persons.map((person: any, i: number) => (
                          <div key={i} className="flex flex-col">
                            <span className="text-sm font-medium text-white">{person.name}</span>
                            <span className="text-xs text-neutral-500">{person.phone}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              ) : (!user && step === 'details') ? (
                <div className="py-2">
                  <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Sign in to continue</h3>
                  <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
                    Please sign in with your Google account to purchase a pass for this event.
                  </p>
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full h-[52px] bg-white text-black font-semibold rounded-xl flex items-center justify-center gap-3 hover:bg-neutral-100 transition-all shadow-sm border border-neutral-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                  <p className="text-xs text-neutral-600 mt-6 leading-relaxed">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              ) : (
                <>
                  {step === 'details' && (
                    <div className="text-left">
                      <div className="flex justify-between items-end mb-6 pb-6 border-b border-white/[0.06]">
                        <div>
                          <p className="text-xs text-neutral-600 uppercase tracking-wider mb-1">
                            {isFreeEvent ? 'Free entry' : 'Price per pass'}
                          </p>
                          <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">
                            {isFreeEvent ? 'FREE' : `₹${event.price}`}
                          </p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-lg border ${isFreeEvent ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-purple-400 bg-purple-500/10 border-purple-500/20'}`}>
                          {isFreeEvent ? '⚡ Instant' : 'UPI • ₹0 fees'}
                        </span>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-400 mb-2">Your Name <span className="text-red-400">*</span></label>
                          <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="input-field text-sm" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-400 mb-2">Email <span className="text-red-400">*</span></label>
                          <input type="email" required value={email} readOnly className="input-field text-sm opacity-60 bg-neutral-900 cursor-not-allowed" />
                          <p className="text-[10px] text-neutral-600 mt-1.5 flex items-center gap-1 italic">Verified via Google Authentication</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-400 mb-2">Phone <span className="text-neutral-600">(optional)</span></label>
                          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="For WhatsApp notification" className="input-field text-sm" />
                        </div>
                        {isFreeEvent ? (
                          <button onClick={() => { if (name && email && isValidEmail(email)) submitFreePass(); }}
                            disabled={!name || !email || !isValidEmail(email) || submitting}
                            className="btn-primary w-full h-[48px] flex items-center justify-center gap-2 text-sm disabled:opacity-40 mt-2">
                            <span>{submitting ? 'Getting your pass...' : 'Get Free Pass'}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                          </button>
                        ) : (
                          <button onClick={() => { if (name && email && isValidEmail(email)) setStep('pay'); else if (email && !isValidEmail(email)) setEmailError('Please enter a valid email'); }}
                            disabled={!name || !email || !isValidEmail(email)}
                            className="btn-primary w-full h-[48px] flex items-center justify-center gap-2 text-sm disabled:opacity-40 mt-2">
                            <span>Proceed to Pay ₹{event.price}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-neutral-600">
                        <svg className="w-4 h-4 text-green-500/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        {isFreeEvent ? 'Instant pass delivery via email' : 'Direct UPI — Zero platform fees'}
                      </div>
                    </div>
                  )}

                  {step === 'pay' && !isFreeEvent && (
                    <>
                      <button onClick={() => setStep('details')} className="text-sm text-neutral-500 hover:text-white mb-4 flex items-center gap-1 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back
                      </button>
                      <h3 className="text-lg font-bold mb-1">Scan & Pay ₹{event.price}</h3>
                      <p className="text-xs text-neutral-500 mb-5">Scan the QR code below with any UPI app (Google Pay, PhonePe, Paytm, etc.)</p>
                      <div className="flex flex-col items-center">
                        <div className="bg-white p-4 rounded-2xl mb-4 shadow-2xl shadow-purple-500/10">
                          <QRCodeSVG value={generateUpiLink()} size={180} level="M" />
                        </div>
                        <div className="text-center mb-4">
                          <p className="text-2xl font-bold text-white">₹{event.price}</p>
                          <p className="text-xs text-neutral-500 mt-1">to <span className="text-green-400 font-mono">{event.upi_id}</span></p>
                        </div>
                      </div>
                      <a href={generateUpiLink()} className="btn-primary w-full h-[44px] flex items-center justify-center gap-2 text-sm mb-4 no-underline">
                        <span>Open UPI App</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                      <div className="flex items-center my-4">
                        <div className="flex-1 border-t border-white/[0.06]" />
                        <span className="px-3 text-xs text-neutral-600">after paying</span>
                        <div className="flex-1 border-t border-white/[0.06]" />
                      </div>
                      <button onClick={() => setStep('utr')} className="btn-secondary w-full h-[44px] text-sm flex items-center justify-center gap-2">
                        <span>I've Paid — Enter Transaction ID</span>
                      </button>
                    </>
                  )}

                  {step === 'utr' && (
                    <>
                      <button onClick={() => setStep('pay')} className="text-sm text-neutral-500 hover:text-white mb-4 flex items-center gap-1 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back
                      </button>
                      <h3 className="text-lg font-bold mb-1">Enter Transaction ID</h3>
                      <p className="text-xs text-neutral-500 mb-5">Enter the 12-digit UTR / Ref No. from your UPI payment confirmation.</p>
                      {submitError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-xl mb-4 flex items-center gap-2">
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" /></svg>
                          {submitError}
                        </div>
                      )}
                      <div className="space-y-4">
                        <div>
                          <input type="text" required value={utrNumber} onChange={(e) => setUtrNumber(e.target.value.replace(/\s/g, ''))}
                            placeholder="e.g. 312456789012" className="input-field font-mono tracking-wider text-center text-lg" />
                          <p className="text-xs text-neutral-600 mt-2 text-center">Find this in your Google Pay / PhonePe payment receipt as &quot;UTR&quot; or &quot;Ref No&quot;</p>
                        </div>
                        <button onClick={submitPaidPass} disabled={submitting || !utrNumber || utrNumber.length < 6}
                          className="btn-primary w-full h-[48px] flex items-center justify-center gap-2 text-sm disabled:opacity-40">
                          <span>{submitting ? 'Verifying...' : 'Submit & Get Pass'}</span>
                        </button>
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300/80">
                          💡 If we can auto-verify your payment, your pass will be approved <strong>instantly</strong>. Otherwise, the organizer will verify it shortly.
                        </div>
                      </div>
                    </>
                  )}

                  {step === 'done' && (
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                        <div className="absolute inset-0 bg-green-400/10 rounded-full animate-ping" />
                        <svg className="w-8 h-8 text-green-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      {(isFreeEvent || passResult?.autoApproved) ? (
                        <>
                          <h3 className="text-xl font-bold mb-2">You&apos;re in! 🎉</h3>
                          <p className="text-neutral-400 text-sm mb-2">Your pass has been approved instantly!</p>
                          <p className="text-neutral-500 text-xs mb-6">Check <strong className="text-white">{email}</strong> for your digital pass with QR code.</p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-xl font-bold mb-2">Pass Requested! 🎉</h3>
                          <p className="text-neutral-400 text-sm mb-2">Your payment is being verified.</p>
                          <p className="text-neutral-500 text-xs mb-6">You&apos;ll get your pass at <strong className="text-white">{email}</strong> once verified.</p>
                        </>
                      )}
                      {passResult?.passNumber && (
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-sm mb-6">
                          <p className="text-neutral-500 text-xs mb-1">Pass Number</p>
                          <p className="font-mono text-white">{passResult.passNumber}</p>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button onClick={() => { setStep('details'); setUtrNumber(''); setPassResult(null); }}
                          className="btn-primary w-full sm:w-auto inline-flex items-center gap-2 px-6 py-3 text-sm">
                          <span>Get Another Pass</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        </button>
                        <Link href="/" className="btn-secondary w-full sm:w-auto inline-flex items-center gap-2 px-6 py-3 text-sm">
                          <span>Go Home</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

