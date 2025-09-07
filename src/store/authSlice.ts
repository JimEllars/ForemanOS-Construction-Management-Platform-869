import {StateCreator} from 'zustand';
import {User,Company} from '../types';
import {supabase} from '../lib/supabaseClient';

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
  handleSuccessfulLogin: (data: any) => Promise<void>;
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
      set({isLoading: true, error: null});
      console.log('🔐 Attempting login for:', email);

      const {data, error} = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('❌ Supabase auth error:', error);
        // Provide more specific error messages
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
        }
        throw new Error(errorMessage);
      }

      if (!data.user) {
        throw new Error('Login failed: No user data returned from authentication.');
      }

      console.log('✅ Authentication successful, loading profile...');
      await get().handleSuccessfulLogin(data);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      set({error: error.message});
      throw error;
    } finally {
      set({isLoading: false});
    }
  },

  handleSuccessfulLogin: async (data: any) => {
    try {
      console.log('🔍 Loading user profile for:', data.user.email);

      // STEP 1: Fetch the user's profile first.
      const { data: profile, error: profileError } = await supabase
        .from('profiles_fos2025')
        .select('*') // Select all columns from the profile
        .eq('id', data.user.id)
        .single();

      if (profileError || !profile) {
        console.error('❌ Profile fetch error:', profileError);
        throw new Error('Could not find a user profile for your account. Please contact support.');
      }

      // STEP 2: Fetch the company data separately using the company_id from the profile.
      const { data: company, error: companyError } = await supabase
        .from('companies_fos2025')
        .select('*')
        .eq('id', profile.company_id)
        .single();

      if (companyError || !company) {
          console.error('❌ Company fetch error:', companyError);
          throw new Error('Could not load company data associated with your profile. Please contact support.');
      }

      // Combine the data and set the state.
      const profileWithCompany = { ...profile, companies_fos2025: company };
      set({
        user: profileWithCompany,
        company: company,
        session: data.session,
        isAuthenticated: true,
      });
      console.log('✅ User logged in successfully:', profile.name);

    } catch (error: any) {
      console.error('❌ handleSuccessfulLogin failed:', error);
      // Ensure the error is passed up to be displayed to the user.
      throw error;
    }
  },

  register: async (email: string, password: string, name: string, companyName: string) => {
    try {
      set({isLoading: true, error: null});

      // Validate password strength
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        throw new Error('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      }

      console.log('📝 Registering new user:', email);

      // First create a company
      const {data: companyData, error: companyError} = await supabase
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
        throw new Error(`Failed to create company: ${companyError.message}`);
      }

      // Then sign up the user
      const {data, error} = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name,
            company_name: companyName,
            company_id: companyData.id,
          },
        },
      });

      if (error) {
        console.error('❌ Registration error:', error);
        throw new Error(error.message);
      }

      // Create user profile if user was created
      if (data.user) {
        const {error: profileError} = await supabase
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
          // Don't throw here as the user was created successfully
          console.log('⚠️ User created but profile creation failed - will be created on first login');
        }

        console.log('✅ User registered successfully');
      }
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      set({error: error.message});
      throw error;
    } finally {
      set({isLoading: false});
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({isLoading: true, error: null});

      const {error} = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Password reset email sent');
    } catch (error: any) {
      console.error('❌ Password reset failed:', error);
      set({error: error.message});
      throw error;
    } finally {
      set({isLoading: false});
    }
  },

  updatePassword: async (newPassword: string) => {
    try {
      set({isLoading: true, error: null});

      const {error} = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('✅ Password updated successfully');
    } catch (error: any) {
      console.error('❌ Password update failed:', error);
      set({error: error.message});
      throw error;
    } finally {
      set({isLoading: false});
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
      set({error: error.message});
    }
  },

  setUser: (user) => set({user, isAuthenticated: !!user}),
  setCompany: (company) => set({company}),
  setSession: (session) => set({session}),
  setLoading: (isLoading) => set({isLoading}),
  setError: (error) => set({error}),
  clearError: () => set({error: null}),
});