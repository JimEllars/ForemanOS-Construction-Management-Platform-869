import { createClient } from '@supabase/supabase-js';

// Project credentials
const SUPABASE_URL = 'https://crwvpszwcpkjmuyblqiy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyd3Zwc3p3Y3Bram11eWJscWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyNjkxNjMsImV4cCI6MjA3Mjg0NTE2M30.wzo744zhcL8kZIT0Lz3CObERCJzDwjU4spFPVfPk6s0';

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Log successful connection
console.log('Supabase: Connected to', SUPABASE_URL);