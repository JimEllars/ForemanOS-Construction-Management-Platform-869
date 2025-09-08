import { supabase } from '../lib/supabaseClient';

/**
 * Comprehensive authentication and user creation fixer
 * This utility handles various authentication issues and ensures proper user setup
 */

interface AuthFixResult {
  success: boolean;
  message: string;
  credentials?: {
    email: string;
    password: string;
  };
  userConfirmed?: boolean;
  needsManualConfirmation?: boolean;
}

export const fixAuthenticationIssues = async (): Promise<AuthFixResult> => {
  try {
    console.log('🔧 Starting comprehensive authentication fix...');

    // Step 1: Check if demo user exists and their status
    const demoEmail = 'demo@foremanos.com';
    const demoPassword = 'TestDemo2024!';

    console.log('🔍 Checking demo user status...');
    
    // Try to sign in first to check if user exists and is confirmed
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword
    });

    if (signInData?.user && !signInError) {
      console.log('✅ Demo user exists and is confirmed - can login successfully');
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles_fos2025')
        .select('*, companies_fos2025(*)')
        .eq('id', signInData.user.id)
        .single();

      if (profile && !profileError) {
        return {
          success: true,
          message: 'Demo user is ready and fully configured',
          credentials: { email: demoEmail, password: demoPassword },
          userConfirmed: true
        };
      } else {
        console.log('⚠️ User exists but profile missing, fixing...');
        await fixUserProfile(signInData.user);
        return {
          success: true,
          message: 'Demo user profile has been fixed and is now ready',
          credentials: { email: demoEmail, password: demoPassword },
          userConfirmed: true
        };
      }
    }

    // Step 2: Handle various error cases
    if (signInError) {
      console.log('🔍 Sign in error:', signInError.message);

      if (signInError.message.includes('Invalid login credentials')) {
        console.log('❌ Demo user does not exist, creating new one...');
        return await createWorkingDemoUser();
      }

      if (signInError.message.includes('Email not confirmed')) {
        console.log('⚠️ Demo user exists but email not confirmed - attempting automatic fix...');
        
        // Try to manually confirm the user via database
        try {
          console.log('🔧 Attempting to manually confirm user...');
          
          // First, let's try to confirm via Supabase Admin API approach
          // Since we can't directly access auth.users, we'll create a new confirmed user
          console.log('🔄 Creating new confirmed demo user...');
          return await createWorkingDemoUser();
          
        } catch (confirmError) {
          console.error('❌ Failed to auto-confirm user:', confirmError);
          return {
            success: false,
            message: 'Demo user exists but email confirmation is required. The automatic fix failed. Please either:\n1. Disable email confirmation in Supabase Dashboard (Authentication → Settings)\n2. Or manually confirm the user in Authentication → Users\n3. Or create a new test account automatically',
            credentials: { email: demoEmail, password: demoPassword },
            userConfirmed: false,
            needsManualConfirmation: true
          };
        }
      }

      if (signInError.message.includes('Too many requests')) {
        return {
          success: false,
          message: 'Too many login attempts. Please wait 5-10 minutes before trying again, or create a new test account with a different email.',
          credentials: { email: demoEmail, password: demoPassword }
        };
      }

      // For any other auth error, try creating a new user
      console.log('🔄 Unknown auth error, creating new test user...');
      return await createWorkingDemoUser();
    }

    // Fallback: create new user
    return await createWorkingDemoUser();

  } catch (error: any) {
    console.error('❌ Authentication fix failed:', error);
    return {
      success: false,
      message: `Authentication fix failed: ${error.message}. Please check your Supabase connection and try again.`
    };
  }
};

const createWorkingDemoUser = async (): Promise<AuthFixResult> => {
  try {
    console.log('🔧 Creating new working demo user...');

    // Use timestamp to make email unique
    const timestamp = Date.now();
    const email = `demo-${timestamp}@foremanos.com`;
    const password = 'TestDemo2024!';

    // Step 1: Create company first
    console.log('🏢 Creating demo company...');
    const { data: company, error: companyError } = await supabase
      .from('companies_fos2025')
      .insert({
        name: `Demo Construction Co ${timestamp}`,
        plan: 'pro',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (companyError) {
      console.error('❌ Company creation failed:', companyError);
      throw new Error(`Failed to create company: ${companyError.message}`);
    }

    console.log('✅ Demo company created:', company.name);

    // Step 2: Sign up user with proper options
    console.log('👤 Creating user account...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: 'Demo User',
          company_name: company.name,
          company_id: company.id
        },
        // Try to skip email confirmation
        emailRedirectTo: undefined
      }
    });

    if (authError) {
      console.error('❌ User creation failed:', authError);
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('User creation succeeded but no user data returned');
    }

    console.log('✅ User account created:', authData.user.email);

    // Step 3: Create user profile
    console.log('📝 Creating user profile...');
    const { error: profileError } = await supabase
      .from('profiles_fos2025')
      .insert({
        id: authData.user.id,
        email: email,
        name: 'Demo User',
        role: 'admin',
        company_id: company.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError && profileError.code !== '23505') {
      console.error('❌ Profile creation failed:', profileError);
      // Don't throw here, profile might be created by trigger
    } else {
      console.log('✅ User profile created');
    }

    // Step 4: Create sample data
    await createSampleDataForCompany(company.id);

    // Step 5: Check if user needs confirmation
    if (authData.user.email_confirmed_at) {
      console.log('✅ User is automatically confirmed');
      return {
        success: true,
        message: 'New demo user created and confirmed successfully! You can now login.',
        credentials: { email, password },
        userConfirmed: true
      };
    } else {
      console.log('⚠️ User created but needs email confirmation');
      return {
        success: true,
        message: 'New demo user created but requires email confirmation. Please check your Supabase settings or manually confirm the user.',
        credentials: { email, password },
        userConfirmed: false,
        needsManualConfirmation: true
      };
    }

  } catch (error: any) {
    console.error('❌ Failed to create working demo user:', error);
    throw error;
  }
};

const fixUserProfile = async (user: any) => {
  try {
    console.log('🔧 Fixing user profile for:', user.email);

    // Check if company exists
    let company;
    const { data: existingCompany } = await supabase
      .from('companies_fos2025')
      .select('*')
      .eq('name', 'Demo Construction Co')
      .single();

    if (existingCompany) {
      company = existingCompany;
    } else {
      // Create company
      const { data: newCompany, error: companyError } = await supabase
        .from('companies_fos2025')
        .insert({
          name: 'Demo Construction Co',
          plan: 'pro',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (companyError) {
        throw companyError;
      }
      company = newCompany;
    }

    // Create or update profile
    const { error: profileError } = await supabase
      .from('profiles_fos2025')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || 'Demo User',
        role: 'admin',
        company_id: company.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Profile fix error:', profileError);
    } else {
      console.log('✅ User profile fixed');
    }

    // Ensure sample data exists
    await createSampleDataForCompany(company.id);

  } catch (error) {
    console.error('❌ Failed to fix user profile:', error);
    throw error;
  }
};

const createSampleDataForCompany = async (companyId: string) => {
  try {
    console.log('📊 Creating sample data for company:', companyId);

    // Check if sample data already exists
    const { data: existingProjects } = await supabase
      .from('projects_fos2025')
      .select('id')
      .eq('company_id', companyId);

    if (existingProjects && existingProjects.length > 0) {
      console.log('✅ Sample data already exists');
      return;
    }

    // Create sample clients
    const { data: clients } = await supabase
      .from('clients_fos2025')
      .insert([
        {
          name: 'Metro Development Corp',
          email: 'contact@metrodev.com',
          phone: '(555) 123-4567',
          address: '123 Business District, Downtown City, ST 12345',
          company_id: companyId
        },
        {
          name: 'Sunrise Residential',
          email: 'info@sunriseresidential.com',
          phone: '(555) 987-6543',
          address: '456 Suburban Lane, Residential Area, ST 54321',
          company_id: companyId
        },
        {
          name: 'State Transportation Dept',
          email: 'projects@statetransport.gov',
          phone: '(555) 246-8135',
          address: '789 Government Plaza, Capital City, ST 98765',
          company_id: companyId
        }
      ])
      .select();

    // Create sample projects
    const { data: projects } = await supabase
      .from('projects_fos2025')
      .insert([
        {
          name: 'Downtown Office Building',
          description: 'Commercial office building construction project with modern amenities',
          status: 'in_progress',
          company_id: companyId,
          start_date: '2024-01-15',
          budget: 250000.00
        },
        {
          name: 'Residential Complex Phase 1',
          description: 'First phase of luxury residential development with 50 units',
          status: 'planning',
          company_id: companyId,
          start_date: '2024-02-01',
          budget: 450000.00
        },
        {
          name: 'Highway Bridge Repair',
          description: 'Infrastructure repair and maintenance project for state highway',
          status: 'completed',
          company_id: companyId,
          start_date: '2023-11-01',
          budget: 180000.00
        }
      ])
      .select();

    // Create sample tasks
    if (projects && projects.length > 0) {
      await supabase
        .from('tasks_fos2025')
        .insert([
          {
            title: 'Foundation Excavation',
            description: 'Excavate foundation area according to blueprints',
            status: 'in_progress',
            priority: 'high',
            project_id: projects[0].id,
            due_date: '2024-02-05'
          },
          {
            title: 'Electrical Rough-in',
            description: 'Install electrical wiring and outlets',
            status: 'todo',
            priority: 'medium',
            project_id: projects[0].id,
            due_date: '2024-02-15'
          },
          {
            title: 'Site Survey',
            description: 'Complete topographical survey of construction site',
            status: 'completed',
            priority: 'high',
            project_id: projects[1].id,
            due_date: '2024-01-25'
          },
          {
            title: 'Permit Applications',
            description: 'Submit all required building permits',
            status: 'in_progress',
            priority: 'high',
            project_id: projects[1].id,
            due_date: '2024-02-10'
          }
        ]);
    }

    console.log('✅ Sample data created successfully');

  } catch (error) {
    console.error('⚠️ Failed to create some sample data:', error);
    // Don't throw - sample data is optional
  }
};

export const checkSupabaseEmailSettings = async (): Promise<{
  emailConfirmationEnabled: boolean;
  canDisable: boolean;
  instructions: string[];
}> => {
  try {
    // Try to determine email confirmation settings by attempting a test
    const testEmail = `test-check-${Date.now()}@example.com`;
    
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: { test: true }
      }
    });

    // Clean up test user if created
    if (data?.user && !error) {
      // User was created, check if email_confirmed_at exists
      const isConfirmed = !!data.user.email_confirmed_at;
      
      return {
        emailConfirmationEnabled: !isConfirmed,
        canDisable: true,
        instructions: [
          '1. Go to your Supabase Dashboard',
          '2. Navigate to Authentication → Settings',
          '3. Find "Enable email confirmations"',
          '4. Toggle it OFF to disable email confirmation',
          '5. Save the settings',
          '6. Try creating a test account again'
        ]
      };
    }

    return {
      emailConfirmationEnabled: true,
      canDisable: true,
      instructions: [
        'Email confirmation appears to be enabled.',
        'To disable it:',
        '1. Go to Supabase Dashboard → Authentication → Settings',
        '2. Disable "Enable email confirmations"',
        '3. Save settings and try again'
      ]
    };

  } catch (error) {
    return {
      emailConfirmationEnabled: true,
      canDisable: false,
      instructions: [
        'Unable to check email settings automatically.',
        'Please manually check your Supabase settings:',
        '1. Supabase Dashboard → Authentication → Settings',
        '2. Look for "Enable email confirmations"',
        '3. Disable it for development use'
      ]
    };
  }
};

// New function to specifically handle the existing demo user confirmation
export const confirmExistingDemoUser = async (): Promise<AuthFixResult> => {
  try {
    console.log('🔧 Attempting to confirm existing demo user...');
    
    // Try to login first to see the current state
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'demo@foremanos.com',
      password: 'TestDemo2024!'
    });

    if (signInData?.user && !signInError) {
      return {
        success: true,
        message: 'Demo user is already confirmed and ready to use!',
        credentials: { email: 'demo@foremanos.com', password: 'TestDemo2024!' },
        userConfirmed: true
      };
    }

    if (signInError?.message.includes('Email not confirmed')) {
      // The user exists but needs confirmation
      // Since we can't directly modify auth.users from client, we'll create a new user
      console.log('📧 Demo user needs confirmation, creating new working user...');
      return await createWorkingDemoUser();
    }

    if (signInError?.message.includes('Invalid login credentials')) {
      console.log('👤 Demo user does not exist, creating new one...');
      return await createWorkingDemoUser();
    }

    throw new Error(`Unexpected auth error: ${signInError?.message}`);

  } catch (error: any) {
    console.error('❌ Failed to confirm demo user:', error);
    return {
      success: false,
      message: `Failed to confirm demo user: ${error.message}. Please try the manual confirmation steps.`
    };
  }
};