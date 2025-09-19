import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { task } = await req.json();
    if (!task || !task.assigned_to) {
      return new Response(JSON.stringify({ error: 'Task and assigned_to are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { data: assignedUser, error: userError } = await supabaseClient
      .from('profiles_fos2025')
      .select('email')
      .eq('id', task.assigned_to)
      .single();

    if (userError || !assignedUser) {
      return new Response(JSON.stringify({ error: 'Assigned user not found.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const taskLink = `${Deno.env.get('VITE_APP_URL')}/app/tasks`;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: assignedUser.email,
      subject: `You have been assigned a new task: ${task.name}`,
      html: `
        <p>Hello,</p>
        <p>You have been assigned a new task: <strong>${task.name}</strong>.</p>
        <p><strong>Project:</strong> ${task.project_name}</p>
        <p><strong>Description:</strong> ${task.description || 'No description'}</p>
        <p>You can view the task details here:</p>
        <a href="${taskLink}" style="display:inline-block;padding:10px 20px;color:white;background-color:#007bff;text-decoration:none;border-radius:5px;">View Task</a>
        <p>Thanks,<br/>The ForemanOS Team</p>
      `,
    });

    return new Response(JSON.stringify({ success: true, message: 'Notification sent successfully.' }), {
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
