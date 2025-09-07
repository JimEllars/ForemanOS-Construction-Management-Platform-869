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
    flowType: 'pkce'
  },
  global: {
    headers: {
      'apikey': SUPABASE_ANON_KEY
    }
  }
});

// Enhanced connection test with better error handling
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('companies_fos2025').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('✅ Supabase: Connected successfully to', SUPABASE_URL);
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};

// Test connection on load
testConnection();

export default supabase;