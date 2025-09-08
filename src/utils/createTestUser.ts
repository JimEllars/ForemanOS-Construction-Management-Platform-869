// Utility to create test user programmatically with confirmed email
import {supabase} from '../lib/supabaseClient';

export const createTestUser = async () => {
  try {
    console.log('🔧 Creating confirmed test user account...');

    // Step 1: Create company first
    const {data: company, error: companyError} = await supabase
      .from('companies_fos2025')
      .insert({
        name: 'Demo Construction Co',
        plan: 'pro',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (companyError && companyError.code !== '23505') {
      // If not a duplicate key error, throw it
      console.error('Failed to create company:', companyError);
      throw companyError;
    }

    let finalCompany = company;
    
    // If company creation failed due to duplicate, get the existing one
    if (companyError?.code === '23505') {
      console.log('📝 Company already exists, fetching existing...');
      const {data: existingCompany, error: fetchError} = await supabase
        .from('companies_fos2025')
        .select('*')
        .eq('name', 'Demo Construction Co')
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      finalCompany = existingCompany;
    }

    console.log('✅ Company ready:', finalCompany.id);

    // Step 2: Sign up the user with Supabase Auth
    // The key is to use admin API or ensure confirmation
    const {data: authData, error: authError} = await supabase.auth.signUp({
      email: 'demo@foremanos.com',
      password: 'TestDemo2024!',
      options: {
        data: {
          name: 'Demo User',
          company_name: 'Demo Construction Co',
          company_id: finalCompany.id,
        },
        // This should bypass email confirmation in development
        emailRedirectTo: undefined
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('✅ User already exists, attempting to confirm...');
        
        // Try to sign in to check if the user is confirmed
        const {data: signInData, error: signInError} = await supabase.auth.signInWithPassword({
          email: 'demo@foremanos.com',
          password: 'TestDemo2024!'
        });

        if (signInError) {
          if (signInError.message.includes('Email not confirmed')) {
            throw new Error('Test user exists but email is not confirmed. Please check your Supabase project settings to disable email confirmation for development, or manually confirm the user in your Supabase dashboard.');
          }
          throw signInError;
        }

        console.log('✅ Existing user is confirmed and can sign in');
        return {
          email: 'demo@foremanos.com',
          password: 'TestDemo2024!',
          company: finalCompany,
          message: 'Test user already exists and is confirmed'
        };
      }
      
      console.error('Failed to create auth user:', authError);
      throw authError;
    }

    console.log('✅ Auth user created:', authData.user?.id);

    // Step 3: Create the profile manually if it wasn't auto-created
    if (authData.user) {
      const {error: profileError} = await supabase
        .from('profiles_fos2025')
        .insert({
          id: authData.user.id,
          email: 'demo@foremanos.com',
          name: 'Demo User',
          role: 'admin',
          company_id: finalCompany.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError && profileError.code !== '23505') {
        // Ignore duplicate key errors
        console.error('Failed to create profile:', profileError);
      } else {
        console.log('✅ Profile created for user');
      }
    }

    // Step 4: Create sample data
    await createSampleData(finalCompany.id);

    console.log('🎉 Test user setup complete!');
    console.log('📧 Email: demo@foremanos.com');
    console.log('🔒 Password: TestDemo2024!');

    return {
      email: 'demo@foremanos.com',
      password: 'TestDemo2024!',
      company: finalCompany,
      message: 'Test user created successfully'
    };

  } catch (error) {
    console.error('❌ Failed to create test user:', error);
    throw error;
  }
};

const createSampleData = async (companyId: string) => {
  try {
    // Create sample clients
    const {data: clients} = await supabase
      .from('clients_fos2025')
      .insert([
        {
          name: 'Metro Development Corp',
          email: 'contact@metrodev.com',
          phone: '(555) 123-4567',
          address: '123 Business District, Downtown City, ST 12345',
          company_id: companyId,
        },
        {
          name: 'Sunrise Residential',
          email: 'info@sunriseresidential.com',
          phone: '(555) 987-6543',
          address: '456 Suburban Lane, Residential Area, ST 54321',
          company_id: companyId,
        },
        {
          name: 'State Transportation Dept',
          email: 'projects@statetransport.gov',
          phone: '(555) 246-8135',
          address: '789 Government Plaza, Capital City, ST 98765',
          company_id: companyId,
        }
      ])
      .select();

    console.log('✅ Sample clients created:', clients?.length || 0);

    // Create sample projects
    const {data: projects} = await supabase
      .from('projects_fos2025')
      .insert([
        {
          name: 'Downtown Office Building',
          description: 'Commercial office building construction project with modern amenities',
          status: 'in_progress',
          company_id: companyId,
          start_date: '2024-01-15',
          budget: 250000.00,
        },
        {
          name: 'Residential Complex Phase 1',
          description: 'First phase of luxury residential development with 50 units',
          status: 'planning',
          company_id: companyId,
          start_date: '2024-02-01',
          budget: 450000.00,
        },
        {
          name: 'Highway Bridge Repair',
          description: 'Infrastructure repair and maintenance project for state highway',
          status: 'completed',
          company_id: companyId,
          start_date: '2023-11-01',
          budget: 180000.00,
        }
      ])
      .select();

    console.log('✅ Sample projects created:', projects?.length || 0);

    // Create sample tasks for the projects
    if (projects && projects.length > 0) {
      const {data: tasks} = await supabase
        .from('tasks_fos2025')
        .insert([
          {
            title: 'Foundation Excavation',
            description: 'Excavate foundation area according to blueprints',
            status: 'in_progress',
            priority: 'high',
            project_id: projects[0].id,
            due_date: '2024-02-05',
          },
          {
            title: 'Electrical Rough-in',
            description: 'Install electrical wiring and outlets',
            status: 'todo',
            priority: 'medium',
            project_id: projects[0].id,
            due_date: '2024-02-15',
          },
          {
            title: 'Site Survey',
            description: 'Complete topographical survey of construction site',
            status: 'completed',
            priority: 'high',
            project_id: projects[1].id,
            due_date: '2024-01-25',
          },
          {
            title: 'Permit Applications',
            description: 'Submit all required building permits',
            status: 'in_progress',
            priority: 'high',
            project_id: projects[1].id,
            due_date: '2024-02-10',
          }
        ]);

      console.log('✅ Sample tasks created:', tasks?.length || 0);
    }
  } catch (error) {
    console.error('⚠️ Failed to create some sample data:', error);
    // Don't throw - sample data creation is optional
  }
};

// Alternative function to create a working test user
export const createWorkingTestUser = async () => {
  try {
    console.log('🔧 Creating working test user with different email...');

    // Use a different email to avoid conflicts
    const testEmail = `test-${Date.now()}@foremanos.com`;
    const testPassword = 'TestDemo2024!';

    // Step 1: Create company
    const {data: company, error: companyError} = await supabase
      .from('companies_fos2025')
      .insert({
        name: `Test Company ${Date.now()}`,
        plan: 'pro',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (companyError) {
      console.error('Failed to create company:', companyError);
      throw companyError;
    }

    console.log('✅ Company created:', company.id);

    // Step 2: Sign up user
    const {data: authData, error: authError} = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test User',
          company_name: company.name,
          company_id: company.id,
        }
      },
    });

    if (authError) {
      console.error('Failed to create auth user:', authError);
      throw authError;
    }

    console.log('✅ Auth user created:', authData.user?.id);

    // Step 3: Create profile
    if (authData.user) {
      const {error: profileError} = await supabase
        .from('profiles_fos2025')
        .insert({
          id: authData.user.id,
          email: testEmail,
          name: 'Test User',
          role: 'admin',
          company_id: company.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError && profileError.code !== '23505') {
        console.error('Failed to create profile:', profileError);
      } else {
        console.log('✅ Profile created for user');
      }
    }

    // Step 4: Create sample data
    await createSampleData(company.id);

    return {
      email: testEmail,
      password: testPassword,
      company: company,
      message: 'New test user created successfully'
    };

  } catch (error) {
    console.error('❌ Failed to create working test user:', error);
    throw error;
  }
};