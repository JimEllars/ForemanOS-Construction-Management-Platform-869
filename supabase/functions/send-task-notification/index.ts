import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'https://esm.sh/resend';

// CORS headers to allow requests from the app's domain
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Replace with your app's domain in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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

    // Get task_id and assignee_id from the request body
    const { task_id, assignee_id } = await req.json();
    if (!task_id || !assignee_id) {
      return new Response(JSON.stringify({ error: 'task_id and assignee_id are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Fetch task details
    const { data: task, error: taskError } = await supabaseClient
      .from('tasks')
      .select('title, projects(name)')
      .eq('id', task_id)
      .single();

    if (taskError || !task) {
      throw new Error('Task not found.');
    }

    // Fetch assignee details
    const { data: assignee, error: assigneeError } = await supabaseClient
      .from('profiles_fos2025')
      .select('email, name')
      .eq('id', assignee_id)
      .single();

    if (assigneeError || !assignee) {
      throw new Error('Assignee not found.');
    }

    // Send notification email using Resend
    const taskLink = `${Deno.env.get('VITE_APP_URL')}/#/app/tasks?taskId=${task_id}`;
    const projectName = task.projects.name;
    const assignerName = user.user_metadata.name || user.email;

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: assignee.email,
      subject: `New Task Assigned to You in ${projectName}`,
      html: `
        <p>Hello ${assignee.name || ''},</p>
        <p>A new task has been assigned to you by <strong>${assignerName}</strong> in the project <strong>${projectName}</strong>.</p>
        <p><strong>Task:</strong> ${task.title}</p>
        <p>Click the link below to view the task:</p>
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
