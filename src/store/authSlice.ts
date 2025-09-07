import { StateCreator } from 'zustand';
import { User, Company } from '../types';
import { supabase } from '../lib/supabaseClient';

export interface AuthSlice {
  user: User | null;
  company: Company | null;
  session: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, companyName: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setCompany: (company: Company | null) => void;
  setSession: (session: any) => void;
  setLoading: (loading: boolean) => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  user: null,
  company: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch user profile and company data
        const { data: profile } = await supabase
          .from('profiles_fos2025')
          .select('*, companies_fos2025(*)')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          set({
            user: profile,
            company: profile.companies_fos2025,
            session: data.session,
            isAuthenticated: true,
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email: string, password: string, name: string, companyName: string) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            company_name: companyName,
          },
        },
      });

      if (error) throw error;
      
      // The handle_new_user_signup function will create the company and profile
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({
        user: null,
        company: null,
        session: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setCompany: (company) => set({ company }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
});