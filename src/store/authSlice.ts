import { StateCreator } from 'zustand';
import { User, Company } from '../types';
import { supabase } from '../lib/supabaseClient';

export interface AuthSlice {
  user: User | null;
  company: Company | null;
  session: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, companyName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  setUser: (user: User | null) => void;
  setCompany: (company: Company | null) => void;
  setSession: (session: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  user: null,
  company: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('🔐 Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('No user data returned');
      }

      console.log('✅ Login successful, fetching profile...');

      // Fetch user profile and company data with better error handling
      const { data: profile, error: profileError } = await supabase
        .from('profiles_fos2025')
        .select(`
          *,
          companies_fos2025 (*)
        `)
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        
        // If profile doesn't exist, create one
        if (profileError.code === 'PGRST116') {
          console.log('📝 Creating missing profile...');
          
          // First create a company if user doesn't have one
          const { data: newCompany, error: companyError } = await supabase
            .from('companies_fos2025')
            .insert({
              name: `${data.user.email?.split('@')[0]} Company`,
              plan: 'free',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (companyError) {
            console.error('❌ Company creation error:', companyError);
            throw new Error('Failed to create company profile');
          }

          // Then create the user profile
          const { data: newProfile, error: newProfileError } = await supabase
            .from('profiles_fos2025')
            .insert({
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
              role: 'admin',
              company_id: newCompany.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select(`
              *,
              companies_fos2025 (*)
            `)
            .single();

          if (newProfileError) {
            console.error('❌ Profile creation error:', newProfileError);
            throw new Error('Failed to create user profile');
          }

          set({
            user: newProfile,
            company: newCompany,
            session: data.session,
            isAuthenticated: true,
          });
          
          console.log('✅ Profile created and user logged in');
          return;
        } else {
          throw new Error('Failed to load user profile');
        }
      }

      if (profile) {
        set({
          user: profile,
          company: profile.companies_fos2025,
          session: data.session,
          isAuthenticated: true,
        });
        console.log('✅ User logged in successfully:', profile.name);
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email: string, password: string, name: string, companyName: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Validate password strength
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      }

      console.log('📝 Registering new user:', email);
      
      // First create a company
      const { data: companyData, error: companyError } = await supabase
        .from('companies_fos2025')
        .insert({
          name: companyName,
          plan: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (companyError) {
        console.error('❌ Company creation error:', companyError);
        throw new Error('Failed to create company');
      }

      // Then sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name,
            company_name: companyName,
            company_id: companyData.id
          },
        },
      });

      if (error) {
        console.error('❌ Registration error:', error);
        throw new Error(error.message);
      }

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles_fos2025')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name,
            role: 'admin',
            company_id: companyData.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('❌ Profile creation error:', profileError);
        }
        
        console.log('✅ User registered successfully');
      }
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Password reset email sent');
    } catch (error: any) {
      console.error('❌ Password reset failed:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updatePassword: async (newPassword: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Password updated successfully');
    } catch (error: any) {
      console.error('❌ Password update failed:', error);
      set({ error: error.message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      console.log('👋 Logging out...');
      await supabase.auth.signOut();
      set({
        user: null,
        company: null,
        session: null,
        isAuthenticated: false,
        error: null,
      });
      console.log('✅ Logged out successfully');
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      set({ error: error.message });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setCompany: (company) => set({ company }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
});