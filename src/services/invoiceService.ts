import { supabase } from '../lib/supabaseClient';
import { useStore } from '../store';
import { quoteService } from './quoteService';

const INVOICES_TABLE = 'invoices';
const INVOICE_LINE_ITEMS_TABLE = 'invoice_line_items';

export const invoiceService = {
  async getInvoicesByCompany() {
    const companyId = useStore.getState().auth.company?.id;
    if (!companyId) return [];

    const { data, error } = await supabase
      .from(INVOICES_TABLE)
      .select('*, clients_fos2025(name)')
      .eq('company_id', companyId)
      .order('issue_date', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
    return data;
  },

  async getInvoiceById(id: string) {
    const { data, error } = await supabase
      .from(INVOICES_TABLE)
      .select('*, clients_fos2025(name), invoice_line_items(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching invoice details:', error);
      throw error;
    }
    return data;
  },

  async createInvoice(invoiceData: any, lineItems: any[]) {
    // This should be a transaction
    const { data: invoice, error: invoiceError } = await supabase
      .from(INVOICES_TABLE)
      .insert(invoiceData)
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    const lineItemsWithInvoiceId = lineItems.map(item => ({
      ...item,
      invoice_id: invoice.id,
    }));

    const { error: lineItemsError } = await supabase
      .from(INVOICE_LINE_ITEMS_TABLE)
      .insert(lineItemsWithInvoiceId);

    if (lineItemsError) {
      await supabase.from(INVOICES_TABLE).delete().eq('id', invoice.id);
      throw lineItemsError;
    }

    return invoice;
  },

  async createInvoiceFromQuote(quoteId: string) {
    const quote = await quoteService.getQuoteById(quoteId);
    if (!quote) throw new Error("Quote not found");

    const companyId = useStore.getState().auth.company?.id;
    const invoiceNumber = `INV-${Date.now()}`;

    const invoiceData = {
      company_id: companyId,
      project_id: quote.project_id,
      client_id: quote.client_id,
      quote_id: quote.id,
      invoice_number: invoiceNumber,
      status: 'draft',
      total_amount: quote.total_amount,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    };

    const lineItems = quote.quote_line_items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));

    const newInvoice = await this.createInvoice(invoiceData, lineItems);

    // Update quote status to 'invoiced'
    await supabase.from('quotes').update({ status: 'invoiced' }).eq('id', quoteId);

    return newInvoice;
  },

  async updateInvoice(id: string, invoiceData: any, lineItems: any[]) {
    // This should also be a transaction
    const { data: invoice, error: invoiceError } = await supabase
      .from(INVOICES_TABLE)
      .update(invoiceData)
      .eq('id', id)
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    await supabase.from(INVOICE_LINE_ITEMS_TABLE).delete().eq('invoice_id', id);

    const lineItemsWithInvoiceId = lineItems.map(item => ({
      ...item,
      invoice_id: invoice.id,
    }));

    const { error: lineItemsError } = await supabase
      .from(INVOICE_LINE_ITEMS_TABLE)
      .insert(lineItemsWithInvoiceId);

    if (lineItemsError) throw lineItemsError;

    return invoice;
  },

  async deleteInvoice(id: string) {
    const { error } = await supabase
      .from(INVOICES_TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
