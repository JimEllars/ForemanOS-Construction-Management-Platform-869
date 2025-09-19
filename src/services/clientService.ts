import { supabase } from '../lib/supabaseClient';
import { Client } from '../types';
import { useStore } from '../store';

const TABLE_NAME = 'clients_fos2025';
const { getState } = useStore;

export const clientService = {
  async getClientsByCompany(companyId: string): Promise<Client[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }

    return data || [];
  },

  async createClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const { isOnline, addPendingChange } = getState().offline;

    if (!isOnline) {
      const tempId = `temp_${Date.now()}`;
      const optimisticClient: Client = {
        ...clientData,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        syncStatus: 'pending',
      };
      addPendingChange({ type: 'CREATE', entity: 'client', payload: clientData, tempId });
      getState().data.addClient(optimisticClient);
      return optimisticClient;
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(clientData)
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      throw error;
    }

    return data;
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const { isOnline, addPendingChange } = getState().offline;

    if (!isOnline) {
      addPendingChange({ type: 'UPDATE', entity: 'client', payload: { id, ...updates } });
      const updatedClient = { ...getState().data.clients.find(c => c.id === id), ...updates, syncStatus: 'pending' } as Client;
      getState().data.updateClient(id, updatedClient);
      return updatedClient;
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      throw error;
    }

    return data;
  },

  async deleteClient(id: string): Promise<void> {
    const { isOnline, addPendingChange } = getState().offline;

    if (!isOnline) {
      addPendingChange({ type: 'DELETE', entity: 'client', payload: { id } });
      getState().data.removeClient(id);
      return;
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }
};