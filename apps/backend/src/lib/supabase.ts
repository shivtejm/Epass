import { createClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';

// Try multiple paths to find .env.local
const envPaths = [
  path.resolve(process.cwd(), '.env.local'),        // if CWD is root
  path.resolve(process.cwd(), '../../.env.local'),  // if CWD is apps/backend
  path.resolve(__dirname, '../../../../.env.local'), // relative to this file
  path.resolve(__dirname, '../../../.env.local'),    // relative to src
];

envPaths.forEach(p => dotenv.config({ path: p }));

if (!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_URL) {
  console.error('CRITICAL: Supabase URL not found in environment. Checked paths:', envPaths);
  console.error('Current Working Directory:', process.cwd());
}

// Supabase admin client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);
