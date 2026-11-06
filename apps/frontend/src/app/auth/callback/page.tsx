"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // If it's a new user (social login), we might want to create a profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (!profile) {
          await supabase.from('profiles').upsert({
            id: session.user.id,
            full_name: session.user.user_metadata.full_name || session.user.user_metadata.name || '',
            role: 'organizer' // Default to organizer for now
          });
        }

        // Check if there was a return URL stored (e.g. from the purchase page)
        const returnUrl = localStorage.getItem('auth_return_url');
        if (returnUrl) {
          localStorage.removeItem('auth_return_url');
          router.push(returnUrl);
        } else {
          router.push('/organizer/dashboard');
        }
      } else {
        router.push('/login');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
