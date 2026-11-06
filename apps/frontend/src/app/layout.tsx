import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import Navigation from './Navigation';
export const metadata: Metadata = {
  title: 'EPass — Premium Event Ticketing Platform',
  description: 'Create, sell, and scan premium digital event passes effortlessly. Secure payments, instant QR delivery.',
};

// Security Badge Component
function SecurityBadge() {
  return (
    <div className="security-badge">
      <svg className="lock-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span>Bank-Grade Security</span>
    </div>
  );
}

// Trust Seal Component
function TrustSeal() {
  return (
    <div className="trust-seal" title="Verified & Secure Platform">
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="noise">
        {/* Ambient background blobs */}
        <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/[0.07] rounded-full blur-[150px] float-1" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/[0.06] rounded-full blur-[130px] float-2" />
          <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-cyan-600/[0.04] rounded-full blur-[100px] float-3" />
        </div>

        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b border-white/[0.04] bg-black/80 backdrop-blur-2xl">
          <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-xl blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="relative bg-gradient-to-tr from-purple-500 to-blue-500 rounded-xl w-10 h-10 flex items-center justify-center font-bold text-white text-sm shadow-lg">
                  EP
                </div>
              </div>
              <span className="font-bold text-[19px] tracking-tight text-white">EPass</span>
              <TrustSeal />
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <SecurityBadge />
              </div>
              <Navigation />
            </div>
          </div>
        </nav>

        <main className="relative z-10 min-h-[calc(100vh-72px)]">{children}</main>

        {/* Footer with Enhanced Trust Indicators */}
        <footer className="relative z-10 border-t border-white/[0.04] py-10 bg-black/40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-8">
              <div className="flex items-center gap-4">
                <TrustSeal />
                <div>
                  <p className="font-semibold text-white">Trusted by 500+ organizers</p>
                  <p className="text-sm text-neutral-500">Secure payments powered by Stripe</p>
                </div>
              </div>

              {/* Security Certifications */}
              <div className="flex items-center gap-6">
                <div className="encryption-badge">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>SSL Encrypted</span>
                </div>
                <div className="verified-badge">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Verified</span>
                </div>
                <div className="secure-connection">
                  <span>Secure Connection</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/[0.04] text-sm text-neutral-500">
              <p>© 2026 EPass. Premium event ticketing.</p>
              <div className="flex gap-6">
                <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                <Link href="#" className="hover:text-white transition-colors">Support</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
