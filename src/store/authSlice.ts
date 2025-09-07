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
  handleSuccessfulLogin: (data: any) => Promise<void>;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  user: null,
  company: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
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
        console.error('❌ Supabase auth error:', error);
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
      
      // ✅ CRITICAL FIX: Don't call handleSuccessfulLogin here
      // Let the onAuthStateChange listener handle it to prevent race condition
      console.log('🔄 Waiting for auth state change to handle login completion...');

    } catch (error: any) {
      console.error('❌ Login failed:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  handleSuccessfulLogin: async (data: any) => {
    try {
      console.log('🔍 Starting handleSuccessfulLogin for user:', data.user.email);
      console.log('🔍 User ID:', data.user.id);

      // ✅ CRITICAL FIX: Fetch profile and company data BEFORE setting authenticated state
      console.log('📋 Step 1: Fetching user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles_fos2025')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        
        // If profile doesn't exist, create one
        if (profileError.code === 'PGRST116') {
          console.log('📝 Profile not found, creating new profile...');
          
          // Create a default company first
          const { data: newCompany, error: companyError } = await supabase
            .from('companies_fos2025')
            .insert({
              name: `${data.user.email?.split('@')[0] || 'User'}'s Company`,
              plan: 'free',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (companyError) {
            console.error('❌ Company creation error:', companyError);
            throw new Error('Failed to create company profile. Please contact support.');
          }

          // Create the user profile
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
            .select()
            .single();

          if (newProfileError) {
            console.error('❌ Profile creation error:', newProfileError);
            throw new Error('Failed to create user profile. Please contact support.');
          }

          // ✅ ATOMIC STATE UPDATE: Set everything at once, ONLY after all data is ready
          set({
            user: { ...newProfile, companies_fos2025: newCompany },
            company: newCompany,
            session: data.session,
            isAuthenticated: true, // This is the LAST thing we set
            isLoading: false,
            error: null
          });

          console.log('✅ New user profile created and logged in successfully:', newProfile.name);
          return;
        } else {
          throw new Error('Could not load user profile. Please contact support.');
        }
      }

      if (!profile) {
        throw new Error('Could not find a user profile for your account. Please contact support.');
      }

      console.log('✅ Profile loaded successfully:', profile.name);
      console.log('🏢 Profile company_id:', profile.company_id);

      // ✅ STEP 2: Fetch company data
      if (!profile.company_id) {
        console.warn('⚠️ Profile has no company_id, creating default company...');
        
        const { data: newCompany, error: companyError } = await supabase
          .from('companies_fos2025')
          .insert({
            name: `${profile.name || profile.email?.split('@')[0] || 'User'}'s Company`,
            plan: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (companyError) {
          console.error('❌ Company creation error:', companyError);
          throw new Error('Failed to create company profile. Please contact support.');
        }

        // Update the profile with the new company_id
        await supabase
          .from('profiles_fos2025')
          .update({
            company_id: newCompany.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        // ✅ ATOMIC STATE UPDATE: Set everything at once
        set({
          user: { ...profile, company_id: newCompany.id, companies_fos2025: newCompany },
          company: newCompany,
          session: data.session,
          isAuthenticated: true, // This is the LAST thing we set
          isLoading: false,
          error: null
        });

        console.log('✅ Default company created and user logged in successfully');
        return;
      }

      console.log('🔍 Step 2: Fetching company data for company_id:', profile.company_id);
      const { data: company, error: companyError } = await supabase
        .from('companies_fos2025')
        .select('*')
        .eq('id', profile.company_id)
        .single();

      if (companyError || !company) {
        console.error('❌ Company fetch error:', companyError);
        
        // If company doesn't exist, create a default one
        console.log('🏢 Company not found, creating default company...');
        const { data: newCompany, error: newCompanyError } = await supabase
          .from('companies_fos2025')
          .insert({
            name: `${profile.name || profile.email?.split('@')[0] || 'User'}'s Company`,
            plan: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (newCompanyError) {
          console.error('❌ New company creation error:', newCompanyError);
          throw new Error('Failed to create company data. Please contact support.');
        }

        // Update the profile with the new company_id
        await supabase
          .from('profiles_fos2025')
          .update({
            company_id: newCompany.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        // ✅ ATOMIC STATE UPDATE: Set everything at once
        set({
          user: { ...profile, company_id: newCompany.id, companies_fos2025: newCompany },
          company: newCompany,
          session: data.session,
          isAuthenticated: true, // This is the LAST thing we set
          isLoading: false,
          error: null
        });

        console.log('✅ Default company created and user logged in successfully');
        return;
      }

      console.log('✅ Company loaded successfully:', company.name);

      // ✅ FINAL ATOMIC STATE UPDATE: Set everything at once, ONLY after ALL data is ready
      set({
        user: { ...profile, companies_fos2025: company },
        company: company,
        session: data.session,
        isAuthenticated: true, // This is the CRITICAL LAST STATE CHANGE
        isLoading: false,
        error: null
      });

      console.log('✅ User logged in successfully with all data loaded:', profile.name);
      console.log('📊 Login complete. User can now access dashboard.');

    } catch (error: any) {
      console.error('❌ handleSuccessfulLogin failed:', error);
      
      // ✅ CLEAN UP ON FAILURE: Reset to a clean state
      set({
        user: null,
        company: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message
      });
      
      throw error;
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
        throw new Error(`Failed to create company: ${companyError.message}`);
      }

      // Then sign up the user
      const { data, error } = await supabase.auth.signUp({
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
          console.log('⚠️ User created but profile creation failed - will be created on first login');
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
        isLoading: false,
      });
      
      console.log('✅ Logged out successfully');
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setCompany: (company) => set({ company }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
});