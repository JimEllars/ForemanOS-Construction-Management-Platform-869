import { supabase } from '../lib/supabaseClient';
import { useStore } from '../store';

const EXPENSES_TABLE = 'expenses';
const RECEIPTS_BUCKET = 'expense-receipts';

export const expenseService = {
  async getExpensesByCompany() {
    const companyId = useStore.getState().auth.company?.id;
    if (!companyId) return [];

    const { data, error } = await supabase
      .from(EXPENSES_TABLE)
      .select('*, projects_fos2025(name)')
      .eq('company_id', companyId)
      .order('expense_date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
    return data;
  },

  async createExpense(expenseData: any, receiptFile?: File) {
    const companyId = useStore.getState().auth.company?.id;
    if (!companyId) throw new Error("Company not found");

    let receipt_url = null;
    if (receiptFile) {
      const filePath = `${companyId}/${Date.now()}_${receiptFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from(RECEIPTS_BUCKET)
        .upload(filePath, receiptFile);

      if (uploadError) {
        console.error('Error uploading receipt:', uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from(RECEIPTS_BUCKET)
        .getPublicUrl(filePath);

      receipt_url = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from(EXPENSES_TABLE)
      .insert({ ...expenseData, company_id: companyId, receipt_url })
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
    return data;
  },

  async updateExpense(id: string, expenseData: any, receiptFile?: File) {
    let receipt_url = expenseData.receipt_url;
    if (receiptFile) {
      // Note: This doesn't handle deleting the old receipt file.
      // A more robust implementation would do that.
      const companyId = useStore.getState().auth.company?.id;
      const filePath = `${companyId}/${Date.now()}_${receiptFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from(RECEIPTS_BUCKET)
        .upload(filePath, receiptFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(RECEIPTS_BUCKET).getPublicUrl(filePath);
      receipt_url = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from(EXPENSES_TABLE)
      .update({ ...expenseData, receipt_url })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
    return data;
  },

  async deleteExpense(id: string) {
    // Note: This doesn't delete the associated receipt from storage.
    const { error } = await supabase
      .from(EXPENSES_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  },
};
