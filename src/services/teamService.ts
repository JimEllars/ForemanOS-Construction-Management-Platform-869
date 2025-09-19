import { supabase } from '../lib/supabaseClient';

import { useStore } from '../store';

export const teamService = {
  async inviteUser(email: string, role: string) {
    const { data, error } = await supabase.functions.invoke('send-invitation', {
      body: { email, role },
    });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  },

  async getCompanyUsers() {
    const companyId = useStore.getState().auth.company?.id;
    if (!companyId) return [];

    const { data, error } = await supabase
      .from('company_users')
      .select(`
        id,
        role,
        profiles_fos2025 (
          id,
          name,
          email
        )
      `)
      .eq('company_id', companyId);

    if (error) {
      console.error('Error fetching company users:', error);
      throw error;
    }
    return data.map(cu => ({ ...cu.profiles_fos2025, role: cu.role, id: cu.id }));
  },

  async getPendingInvitations() {
    const companyId = useStore.getState().auth.company?.id;
    if (!companyId) return [];

    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'pending');

    if (error) {
      console.error('Error fetching pending invitations:', error);
      throw error;
    }
    return data;
  },

  async validateInvitationToken(token: string) {
    const { data, error } = await supabase.functions.invoke(`accept-invitation?token=${token}`);

    if (error) {
      throw new Error(error.message);
    }
    return data;
  },

  async acceptInvitation(token: string) {
    const { data, error } = await supabase.functions.invoke('accept-invitation', {
      body: { token },
      method: 'POST',
    });

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
};
