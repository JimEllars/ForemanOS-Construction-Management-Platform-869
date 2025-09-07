import {supabase} from '../lib/supabaseClient';

export const demoDataService={
  async ensureDemoDataExists() {
    try {
      console.log('🔧 Ensuring demo data exists...');

      // Check if demo company exists
      const {data: existingCompany}=await supabase
        .from('companies_fos2025')
        .select('id')
        .eq('id','demo-company-fos2025')
        .single();

      if (!existingCompany) {
        console.log('📝 Creating demo company...');
        await supabase
          .from('companies_fos2025')
          .insert({
            id: 'demo-company-fos2025',
            name: 'Demo Construction Company',
            plan: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }

      // Ensure demo user profile exists
      const {data: existingProfile}=await supabase
        .from('profiles_fos2025')
        .select('id')
        .eq('email','demo@foremanos.com')
        .single();

      if (!existingProfile) {
        console.log('📝 Creating demo user profile...');
        
        // First check if the user exists in auth
        const {data: {users},error: listError}=await supabase.auth.admin.listUsers();
        
        if (!listError) {
          const demoUser = users.find(u => u.email === 'demo@foremanos.com');
          
          if (demoUser) {
            // Create profile for existing auth user
            await supabase
              .from('profiles_fos2025')
              .insert({
                id: demoUser.id,
                email: 'demo@foremanos.com',
                name: 'Demo User',
                role: 'admin',
                company_id: 'demo-company-fos2025',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
          }
        }
      }

      // Create demo projects if they don't exist
      const {data: existingProjects}=await supabase
        .from('projects_fos2025')
        .select('id')
        .eq('company_id','demo-company-fos2025');

      if (!existingProjects || existingProjects.length===0) {
        console.log('📝 Creating demo projects...');
        await supabase
          .from('projects_fos2025')
          .insert([
            {
              id: 'demo-project-1',
              name: 'Downtown Office Building',
              description: 'Commercial office building construction project',
              status: 'in_progress',
              company_id: 'demo-company-fos2025',
              start_date: '2025-01-01',
              budget: 250000.00,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-project-2',
              name: 'Residential Complex Phase 1',
              description: 'Multi-unit residential development',
              status: 'planning',
              company_id: 'demo-company-fos2025',
              start_date: '2025-02-15',
              budget: 180000.00,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-project-3',
              name: 'Warehouse Renovation',
              description: 'Complete renovation of existing warehouse',
              status: 'completed',
              company_id: 'demo-company-fos2025',
              start_date: '2024-11-01',
              budget: 75000.00,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
      }

      // Create demo tasks
      const {data: existingTasks}=await supabase
        .from('tasks_fos2025')
        .select('id')
        .eq('project_id','demo-project-1');

      if (!existingTasks || existingTasks.length===0) {
        console.log('📝 Creating demo tasks...');
        await supabase
          .from('tasks_fos2025')
          .insert([
            {
              id: 'demo-task-1',
              title: 'Foundation Inspection',
              description: 'Schedule and complete foundation inspection',
              status: 'in_progress',
              priority: 'high',
              project_id: 'demo-project-1',
              due_date: '2025-01-20',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-task-2',
              title: 'Electrical Rough-In',
              description: 'Complete electrical rough-in for floors 1-3',
              status: 'todo',
              priority: 'medium',
              project_id: 'demo-project-1',
              due_date: '2025-01-25',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-task-3',
              title: 'Site Survey',
              description: 'Complete topographical survey of the site',
              status: 'completed',
              priority: 'high',
              project_id: 'demo-project-2',
              due_date: '2025-01-15',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
      }

      // Create demo clients
      const {data: existingClients}=await supabase
        .from('clients_fos2025')
        .select('id')
        .eq('company_id','demo-company-fos2025');

      if (!existingClients || existingClients.length===0) {
        console.log('📝 Creating demo clients...');
        await supabase
          .from('clients_fos2025')
          .insert([
            {
              id: 'demo-client-1',
              name: 'Metro Development Corp',
              email: 'contact@metrodev.com',
              phone: '(555) 123-4567',
              address: '123 Business Ave, Downtown',
              company_id: 'demo-company-fos2025',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-client-2',
              name: 'Green Valley Properties',
              email: 'info@greenvalley.com',
              phone: '(555) 987-6543',
              address: '456 Valley Road, Suburbs',
              company_id: 'demo-company-fos2025',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'demo-client-3',
              name: 'Industrial Solutions LLC',
              email: 'projects@industrialsolutions.com',
              phone: '(555) 456-7890',
              address: '789 Industrial Blvd, Industrial Park',
              company_id: 'demo-company-fos2025',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);
      }

      console.log('✅ Demo data setup complete');
      return true;
    } catch (error) {
      console.error('❌ Error setting up demo data:',error);
      return false;
    }
  }
};