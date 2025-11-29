import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Boşlukları temizle
const SUPABASE_URL = (import.meta.env. VITE_SUPABASE_URL || '').trim();
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

console.log('Supabase URL:', SUPABASE_URL); // Debug için
console.log('Supabase Key exists:', !!SUPABASE_KEY);

if (!SUPABASE_URL || ! SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials! ');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});