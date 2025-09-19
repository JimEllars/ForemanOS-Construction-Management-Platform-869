import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to replace placeholders in the HTML template
function populateTemplate(template: string, data: any): string {
  let populated = template;
  const lineItemsHtml = data.quote_line_items.map(item => `
    <tr>
      <td>${item.description}</td>
      <td>${item.quantity}</td>
      <td>$${parseFloat(item.unit_price).toFixed(2)}</td>
      <td>$${parseFloat(item.total_price).toFixed(2)}</td>
    </tr>
  `).join('');

  const tax = data.total_amount * 0.08; // Assuming 8% tax, adjust as needed
  const subtotal = data.total_amount - tax;

  const replacements = {
    '{{company_name}}': data.company_name || 'ForemanOS Inc.',
    '{{company_address}}': data.company_address || '123 Construction Way, Builder City, ST 12345',
    '{{company_phone}}': data.company_phone || '(555) 123-4567',
    '{{client_name}}': data.clients_fos2025.name,
    '{{client_address}}': data.clients_fos2025.address || '',
    '{{client_email}}': data.clients_fos2025.email || '',
    '{{quote_number}}': data.quote_number,
    '{{issue_date}}': new Date(data.issue_date).toLocaleDateString(),
    '{{expiry_date}}': data.expiry_date ? new Date(data.expiry_date).toLocaleDateString() : 'N/A',
    '{{line_items}}': lineItemsHtml,
    '{{subtotal}}': subtotal.toFixed(2),
    '{{tax}}': tax.toFixed(2),
    '{{total}}': parseFloat(data.total_amount).toFixed(2),
  };

  for (const key in replacements) {
    populated = populated.replace(new RegExp(key, 'g'), replacements[key]);
  }
  return populated;
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

    const url = new URL(req.url);
    const quoteId = url.searchParams.get('quoteId');
    if (!quoteId) throw new Error('quoteId is required.');

    // Fetch quote data
    const { data: quoteData, error } = await supabaseClient
      .from('quotes')
      .select('*, clients_fos2025(*), quote_line_items(*)')
      .eq('id', quoteId)
      .single();

    if (error) throw error;
    if (!quoteData) throw new Error('Quote not found.');

    // Read and populate the HTML template
    const templatePath = new URL('./template.html', import.meta.url).pathname;
    const htmlTemplate = await Deno.readTextFile(templatePath);
    const populatedHtml = populateTemplate(htmlTemplate, quoteData);

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(populatedHtml, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Quote-${quoteData.quote_number}.pdf"`,
      },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
