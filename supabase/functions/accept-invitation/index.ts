import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function validateToken(supabase: SupabaseClient, token: string) {
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('*, companies_fos2025(name), profiles_fos2025!invitations_invited_by_fkey(name)')
    .eq('token', token)
    .single();

  if (error || !invitation) {
    throw new Error('Invalid or expired invitation token.');
  }

  if (invitation.status !== 'pending') {
    throw new Error('This invitation has already been used or has expired.');
  }

  // Check if expired
  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error('This invitation has expired.');
  }

  return {
    company_name: invitation.companies_fos2025.name,
    invited_by_name: invitation.profiles_fos2025.name,
  };
}

async function acceptInvitation(supabase: SupabaseClient, token: string) {
  // 1. Get user from session
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('User not authenticated.');

  // 2. Get invitation details
  const { data: invitation, error: inviteError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single();

  if (inviteError || !invitation) throw new Error('Invalid invitation token.');
  if (invitation.status !== 'pending') throw new Error('Invitation already used or expired.');
  if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
    throw new Error("This invitation is for a different email address.");
  }

  // 3. Add user to the company
  const { error: insertError } = await supabase
    .from('company_users')
    .insert({
      company_id: invitation.company_id,
      user_id: user.id,
      role: invitation.role,
    });

  if (insertError) {
    // Handle case where user is already in the company
    if (insertError.code === '23505') {
      // User is already in the company, we can consider this a success
      // and just update the invitation status.
    } else {
      throw insertError;
    }
  }

  // 4. Update user's primary company if they don't have one
  const { data: profile } = await supabase.from('profiles_fos2025').select('company_id').eq('id', user.id).single();
  if (profile && !profile.company_id) {
    await supabase.from('profiles_fos2025').update({ company_id: invitation.company_id }).eq('id', user.id);
  }

  // 5. Mark invitation as accepted
  const { error: updateError } = await supabase
    .from('invitations')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', invitation.id);

  if (updateError) throw updateError;

  return { success: true, message: 'Invitation accepted successfully!' };
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const token = url.searchParams.get('token');
      if (!token) throw new Error('Token is required.');

      const data = await validateToken(supabaseClient, token);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (req.method === 'POST') {
      const { token } = await req.json();
      if (!token) throw new Error('Token is required.');

      const data = await acceptInvitation(supabaseClient, token);
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
