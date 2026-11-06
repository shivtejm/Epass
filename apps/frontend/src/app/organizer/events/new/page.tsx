"use client"
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const generateEventCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export default function CreateEvent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState<'free' | 'paid'>('free');
  const [price, setPrice] = useState('');
  const [upiId, setUpiId] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [maxPasses, setMaxPasses] = useState('');
  const [contactPersons, setContactPersons] = useState([{ name: '', phone: '' }]);

  const addContactPerson = () => {
    setContactPersons([...contactPersons, { name: '', phone: '' }]);
  };

  const removeContactPerson = (index: number) => {
    setContactPersons(contactPersons.filter((_, i) => i !== index));
  };

  const updateContactPerson = (index: number, field: 'name' | 'phone', value: string) => {
    const newContacts = [...contactPersons];
    newContacts[index][field] = value;
    setContactPersons(newContacts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }

    // Ensure profile exists (fixes foreign key error if tables were reset)
    await supabase.from('profiles').upsert({ id: user.id, role: 'organizer' }, { onConflict: 'id' });

    const eventCode = generateEventCode();
    const finalPrice = eventType === 'free' ? 0 : parseFloat(price);

    const { error: insertError } = await supabase
      .from('events')
      .insert({
        organizer_id: user.id,
        title,
        description,
        date: new Date(date).toISOString(),
        location,
        price: finalPrice,
        event_code: eventCode,
        upi_id: eventType === 'paid' ? upiId : null,
        registration_deadline: registrationDeadline ? new Date(registrationDeadline).toISOString() : null,
        max_passes: maxPasses ? parseInt(maxPasses) : null,
        contact_persons: contactPersons.filter(c => c.name || c.phone),
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push('/organizer/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link href="/organizer/dashboard" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-white mb-8 group transition-colors">
        <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Dashboard
      </Link>
      
      <div className="glass-card p-8 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-purple-600/[0.06] to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
          <p className="text-neutral-500 mb-8 text-sm">Fill in the details. A unique event code and QR will be generated automatically.</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Event Title</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Summer Music Festival 2026"
                className="input-field text-lg font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Date & Time</label>
                <input type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)}
                  className="input-field [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Location</label>
                <input type="text" required value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Grand Arena, Mumbai"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">Description</label>
              <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell attendees what to expect at your event..."
                className="input-field resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Registration Deadline <span className="text-neutral-600">(optional)</span></label>
                <input type="datetime-local" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)}
                  className="input-field [color-scheme:dark]"
                />
                <p className="text-xs text-neutral-600 mt-2">After this date, no new passes can be purchased.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Max Participants <span className="text-neutral-600">(optional)</span></label>
                <input type="number" min="1" value={maxPasses} onChange={(e) => setMaxPasses(e.target.value)}
                  placeholder="Unlimited"
                  className="input-field font-mono"
                />
                <p className="text-xs text-neutral-600 mt-2">Leave blank for unlimited registrations.</p>
              </div>
            </div>

            {/* Contact Persons */}
            <div className="pt-6 border-t border-white/[0.06]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Contact Persons</h3>
                <button type="button" onClick={addContactPerson}
                  className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Person
                </button>
              </div>
              <div className="space-y-3">
                {contactPersons.map((person, index) => (
                  <div key={index} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex-1">
                      <input type="text" value={person.name} onChange={(e) => updateContactPerson(index, 'name', e.target.value)}
                        placeholder="Name" className="input-field text-sm" />
                    </div>
                    <div className="flex-1">
                      <input type="text" value={person.phone} onChange={(e) => updateContactPerson(index, 'phone', e.target.value)}
                        placeholder="Phone Number" className="input-field text-sm" />
                    </div>
                    {contactPersons.length > 1 && (
                      <button type="button" onClick={() => removeContactPerson(index)}
                        className="p-3 text-neutral-500 hover:text-red-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Event Type Toggle */}
            <div className="pt-6 border-t border-white/[0.06]">
              <h3 className="text-lg font-semibold mb-4">Ticket Type</h3>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setEventType('free')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${eventType === 'free' 
                    ? 'border-green-500/50 bg-green-500/[0.05]' 
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${eventType === 'free' ? 'bg-green-500/10 text-green-400' : 'bg-white/[0.05] text-neutral-500'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">Free Event</p>
                      <p className="text-xs text-neutral-500">No payment required</p>
                    </div>
                  </div>
                </button>
                <button type="button" onClick={() => setEventType('paid')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${eventType === 'paid' 
                    ? 'border-purple-500/50 bg-purple-500/[0.05]' 
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${eventType === 'paid' ? 'bg-purple-500/10 text-purple-400' : 'bg-white/[0.05] text-neutral-500'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">Paid Event</p>
                      <p className="text-xs text-neutral-500">Collect via UPI</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Paid Event Fields */}
            {eventType === 'paid' && (
              <div className="space-y-5 p-5 bg-purple-500/[0.03] border border-purple-500/10 rounded-2xl">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Ticket Price (INR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">₹</span>
                    <input type="number" required min="1" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="input-field !pl-10 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Your UPI ID</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <input type="text" required value={upiId} onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@paytm, 9876543210@ybl"
                      className="input-field !pl-14"
                    />
                  </div>
                  <p className="text-xs text-neutral-600 mt-2">Payments go directly to you — 0% platform fee!</p>
                </div>
              </div>
            )}

            {eventType === 'free' && (
              <div className="bg-green-500/5 border border-green-500/15 rounded-2xl p-5 flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                <div>
                  <p className="text-sm font-medium text-green-300">Instant Auto-Approval</p>
                  <p className="text-xs text-neutral-500 mt-1">Free events skip payment. Attendees get their pass and email instantly — no manual approval needed.</p>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button type="submit" disabled={loading || (eventType === 'paid' && (!price || !upiId))}
                className="btn-primary w-full h-[52px] flex items-center justify-center text-base disabled:opacity-50"
              >
                <span>{loading ? 'Creating...' : 'Create Event'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
