"use client"
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function OrganizerPage() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.replace('/organizer/dashboard');
      } else {
        router.replace('/signup');
      }
    };
    check();
  }, [router]);

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
