"use client"
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center p-6">
      <div className="glass-card p-10 max-w-md w-full text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-green-600/[0.08] to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-green-400/10 rounded-full animate-ping" />
            <svg className="w-10 h-10 text-green-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h1 className="text-3xl font-extrabold mb-2">Pass Requested! 🎉</h1>
          <p className="text-neutral-400 text-sm mb-2">Your payment is pending organizer verification.</p>
          <p className="text-neutral-500 text-xs mb-8">You'll receive your digital pass via email once the organizer approves your payment.</p>
          <Link href="/" className="btn-primary inline-flex items-center gap-2 px-8 py-3">
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
