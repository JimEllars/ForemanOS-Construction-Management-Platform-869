import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { randomBytes } from 'https://deno.land/std@0.177.0/node/crypto.ts';

// CORS headers to allow requests from the app's domain
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Replace with your app's domain in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the user's authorization
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Get the current user from the session
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // Get the user's company and role
    const { data: companyUser, error: companyUserError } = await supabaseClient
      .from('company_users')
      .select('company_id, role')
      .eq('user_id', user.id)
      .single();

    if (companyUserError || !companyUser) {
      return new Response(JSON.stringify({ error: 'User not associated with a company.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // Check if the user has permission to invite
    if (companyUser.role !== 'admin' && companyUser.role !== 'manager') {
      return new Response(JSON.stringify({ error: 'You do not have permission to invite users.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // Get email and role from the request body
    const { email, role } = await req.json();
    if (!email || !role) {
      return new Response(JSON.stringify({ error: 'Email and role are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Generate a secure random token
    const token = randomBytes(32).toString('hex');

    // Insert the invitation into the database
    const { error: insertError } = await supabaseClient
      .from('invitations')
      .insert({
        company_id: companyUser.company_id,
        invited_by: user.id,
        email,
        role,
        token,
      });

    if (insertError) {
      // Handle potential unique constraint violation (user already invited)
      if (insertError.code === '23505') {
        return new Response(JSON.stringify({ error: 'This user has already been invited.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 409,
        });
      }
      throw insertError;
    }

    // ** SIMULATED EMAIL SENDING **
    // In a real application, you would use the token to create an invitation link
    // and send it to the user's email address using a service like SendGrid, Postmark, or Resend.
    // Example:
    // const invitationLink = `https://yourapp.com/accept-invitation?token=${token}`;
    // await sendEmail({ to: email, subject: "You're invited to ForemanOS!", body: `Click here to join: ${invitationLink}` });
    console.log(`SIMULATED: Sending email to ${email} with token ${token}`);


    return new Response(JSON.stringify({ success: true, message: 'Invitation sent successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
