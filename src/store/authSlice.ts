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

        // Provide more specific and helpful error messages
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email address. Please check the email or create a new account.';
        } else if (error.message.includes('signup is disabled')) {
          errorMessage = 'Account creation is currently disabled. Please contact support.';
        } else if (error.message.includes('Database error')) {
          errorMessage = 'Database connection error. Please check your internet connection and try again.';
        }

        set({ isLoading: false, error: errorMessage });
        throw new Error(errorMessage);
      }

      if (!data.user) {
        const errorMsg = 'Login failed: No user data returned from authentication.';
        set({ isLoading: false, error: errorMsg });
        throw new Error(errorMsg);
      }

      console.log('✅ Authentication successful, processing login data...');

      // ✅ CRITICAL FIX: Directly handle the successful login here
      try {
        await get().handleSuccessfulLogin({
          user: data.user,
          session: data.session
        });
        console.log('✅ Login process completed successfully');
      } catch (loginError: any) {
        console.error('❌ Failed to complete login process:', loginError);
        set({ isLoading: false, error: loginError.message });
        throw loginError;
      }

    } catch (error: any) {
      console.error('❌ Login failed:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  handleSuccessfulLogin: async (data: any) => {
    try {
      console.log('🔍 Starting enhanced login process for user:', data.user.email);
      console.log('🔍 User ID:', data.user.id);

      // ✅ ENHANCED ERROR HANDLING: More detailed logging and better error messages
      console.log('📋 Step 1: Fetching user profile...');
      let profile;
      let company;

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles_fos2025')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('❌ Profile fetch error details:', {
            code: profileError.code,
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint
          });

          // If profile doesn't exist, create one
          if (profileError.code === 'PGRST116' || profileError.message.includes('No rows found')) {
            console.log('📝 Profile not found, creating new profile and company...');
            
            // Create a default company first
            console.log('🏢 Step 1a: Creating default company...');
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
              throw new Error(`Failed to create company: ${companyError.message}. Please try again or contact support.`);
            }

            console.log('✅ Company created successfully:', newCompany.name);
            company = newCompany;

            // Create the user profile
            console.log('📝 Step 1b: Creating user profile...');
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
              throw new Error(`Failed to create user profile: ${newProfileError.message}. Please contact support.`);
            }

            console.log('✅ Profile created successfully:', newProfile.name);
            profile = newProfile;

          } else {
            // Other database errors
            throw new Error(`Database error while loading profile: ${profileError.message}. Please try again or contact support.`);
          }
        } else {
          console.log('✅ Profile loaded successfully:', profileData.name);
          profile = profileData;
        }

        if (!profile) {
          throw new Error('Could not create or load user profile. Please contact support.');
        }

        // ✅ STEP 2: Fetch or create company data
        if (!company) {
          console.log('🏢 Step 2: Loading company data...');
          
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
              throw new Error(`Failed to create company: ${companyError.message}. Please contact support.`);
            }

            // Update the profile with the new company_id
            await supabase
              .from('profiles_fos2025')
              .update({
                company_id: newCompany.id,
                updated_at: new Date().toISOString()
              })
              .eq('id', profile.id);

            profile.company_id = newCompany.id;
            company = newCompany;
          } else {
            console.log('🔍 Loading existing company for company_id:', profile.company_id);
            const { data: existingCompany, error: companyError } = await supabase
              .from('companies_fos2025')
              .select('*')
              .eq('id', profile.company_id)
              .single();

            if (companyError || !existingCompany) {
              console.error('❌ Company fetch error:', companyError);
              // If company doesn't exist, create a default one
              console.log('🏢 Company not found, creating replacement company...');
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
                throw new Error(`Failed to create company: ${newCompanyError.message}. Please contact support.`);
              }

              // Update the profile with the new company_id
              await supabase
                .from('profiles_fos2025')
                .update({
                  company_id: newCompany.id,
                  updated_at: new Date().toISOString()
                })
                .eq('id', profile.id);

              profile.company_id = newCompany.id;
              company = newCompany;
            } else {
              console.log('✅ Company loaded successfully:', existingCompany.name);
              company = existingCompany;
            }
          }
        }

        // ✅ FINAL VALIDATION: Ensure we have all required data
        if (!profile || !company) {
          throw new Error('Failed to load complete user data. Please try logging in again.');
        }

        // ✅ ATOMIC STATE UPDATE: Set everything at once
        set({
          user: { ...profile, companies_fos2025: company },
          company: company,
          session: data.session,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });

        console.log('✅ Login completed successfully!');
        console.log('📊 User data:', {
          name: profile.name,
          email: profile.email,
          company: company.name,
          role: profile.role
        });

      } catch (dbError: any) {
        console.error('❌ Database operation failed:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

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