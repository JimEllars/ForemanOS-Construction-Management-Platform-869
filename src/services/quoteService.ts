import { supabase } from '../lib/supabaseClient';
import { useStore } from '../store';

const QUOTES_TABLE = 'quotes';
const LINE_ITEMS_TABLE = 'quote_line_items';

export const quoteService = {
  async getQuotesByCompany() {
    const companyId = useStore.getState().auth.company?.id;
    if (!companyId) return [];

    const { data, error } = await supabase
      .from(QUOTES_TABLE)
      .select('*, clients_fos2025(name)')
      .eq('company_id', companyId)
      .order('issue_date', { ascending: false });

    if (error) {
      console.error('Error fetching quotes:', error);
      throw error;
    }
    return data;
  },

  async getQuoteById(id: string) {
    const { data, error } = await supabase
      .from(QUOTES_TABLE)
      .select('*, clients_fos2025(name), quote_line_items(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching quote details:', error);
      throw error;
    }
    return data;
  },

  async createQuote(quoteData: any, lineItems: any[]) {
    // This should be done in a transaction using an RPC function in Supabase
    // for atomicity. For now, we'll do it in sequence.

    // 1. Create the main quote record
    const { data: quote, error: quoteError } = await supabase
      .from(QUOTES_TABLE)
      .insert(quoteData)
      .select()
      .single();

    if (quoteError) {
      console.error('Error creating quote:', quoteError);
      throw quoteError;
    }

    // 2. Add the quote_id to each line item and insert them
    const lineItemsWithQuoteId = lineItems.map(item => ({
      ...item,
      quote_id: quote.id,
    }));

    const { error: lineItemsError } = await supabase
      .from(LINE_ITEMS_TABLE)
      .insert(lineItemsWithQuoteId);

    if (lineItemsError) {
      console.error('Error creating line items:', lineItemsError);
      // In a real app, we should delete the quote record we just created
      // if the line items fail to be created.
      await supabase.from(QUOTES_TABLE).delete().eq('id', quote.id);
      throw lineItemsError;
    }

    return quote;
  },

  async updateQuote(id: string, quoteData: any, lineItems: any[]) {
    // This should also be a transaction.

    // 1. Update the main quote record
    const { data: quote, error: quoteError } = await supabase
      .from(QUOTES_TABLE)
      .update(quoteData)
      .eq('id', id)
      .select()
      .single();

    if (quoteError) {
      console.error('Error updating quote:', quoteError);
      throw quoteError;
    }

    // 2. Delete old line items and insert new ones
    // (A more sophisticated approach would be to diff them)
    await supabase.from(LINE_ITEMS_TABLE).delete().eq('quote_id', id);

    const lineItemsWithQuoteId = lineItems.map(item => ({
      ...item,
      quote_id: quote.id,
    }));

    const { error: lineItemsError } = await supabase
      .from(LINE_ITEMS_TABLE)
      .insert(lineItemsWithQuoteId);

    if (lineItemsError) {
      console.error('Error updating line items:', lineItemsError);
      throw lineItemsError;
    }

    return quote;
  },

  async deleteQuote(id: string) {
    // The database is set up with ON DELETE CASCADE for line items,
    // so we only need to delete the main quote record.
    const { error } = await supabase
      .from(QUOTES_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting quote:', error);
      throw error;
    }
  },

  async downloadQuotePdf(quoteId: string) {
    const { data, error } = await supabase.functions.invoke(`quote-pdf?quoteId=${quoteId}`);

    if (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF. ' + error.message);
    }

    // The function returns the PDF as a blob
    return data;
  },
};
