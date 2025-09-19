import { createClient } from '@supabase/supabase-js';

// Project credentials - Updated with current connection
const SUPABASE_URL = 'https://kggjsepwxxiyvavvepit.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnZ2pzZXB3eHhpeXZhdnZlcGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyOTEzOTMsImV4cCI6MjA3Mjg2NzM5M30.FHxzXNcovwsoO_6eU634Rzx5Sl_XYqj1JscS2i7hcN0';

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
    headers: { 'apikey': SUPABASE_ANON_KEY }
  }
});

// Enhanced connection test with better error handling
const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('companies_fos2025')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase: Connected successfully to', SUPABASE_URL);
    
    // Test auth status
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.warn('⚠️ Session check warning:', sessionError);
    } else if (session) {
      console.log('✅ Active session found for:', session.user?.email);
    } else {
      console.log('ℹ️ No active session');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};

// Test connection on load
testConnection();

export default supabase;