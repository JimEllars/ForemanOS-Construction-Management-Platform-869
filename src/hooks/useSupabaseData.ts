import { useEffect } from 'react';
import { useStore } from '../store';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { clientService } from '../services/clientService';

export const useSupabaseData = () => {
  const { user, company, isAuthenticated, setProjects, setTasks, setClients, setLoading } = useStore();

  useEffect(() => {
    if (isAuthenticated && company?.id && user?.id) {
      console.log('🔄 Data loading conditions met:', {
        isAuthenticated,
        companyId: company.id,
        userId: user.id
      });
      loadAllData();
    } else {
      console.log('⏸️ Data loading conditions not met:', {
        isAuthenticated,
        companyId: company?.id,
        userId: user?.id
      });
      // Reset data when not authenticated
      if (!isAuthenticated) {
        setProjects([]);
        setTasks([]);
        setClients([]);
        setLoading(false);
      }
    }
  }, [isAuthenticated, company?.id, user?.id]);

  const loadAllData = async () => {
    if (!company?.id) {
      console.warn('⚠️ No company ID available for data loading');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Starting sequential data load for company:', company.id);
      setLoading(true);

      // Step 1: Fetch clients (this can run in parallel as it's independent)
      console.log('📋 Starting clients fetch in parallel...');
      const clientsPromise = clientService.getClientsByCompany(company.id);

      // Step 2: Fetch projects first, as tasks are dependent on them
      console.log('📋 Loading projects (required for tasks)...');
      const projects = await projectService.getProjectsByCompany(company.id);
      setProjects(projects);
      console.log('✅ Projects loaded successfully:', projects.length);

      // Step 3: Now that we have projects, fetch their associated tasks
      console.log('📋 Loading tasks (now that projects are available)...');
      const tasks = await taskService.getTasksByCompany(company.id);
      setTasks(tasks);
      console.log('✅ Tasks loaded successfully:', tasks.length);

      // Step 4: Await the clients promise and set the state
      console.log('📋 Completing clients fetch...');
      const clients = await clientsPromise;
      setClients(clients);
      console.log('✅ Clients loaded successfully:', clients.length);

      console.log('🎉 All data loading completed successfully');
      console.log('📊 Final data summary:', {
        projects: projects.length,
        tasks: tasks.length,
        clients: clients.length
      });

    } catch (error) {
      console.error('❌ Critical error during data loading sequence:', error);
      
      // Provide detailed error information
      if (error instanceof Error) {
        console.error('❌ Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }

      // On failure, set all data to empty arrays to prevent a broken UI state
      console.log('🔄 Resetting all data arrays due to error...');
      setProjects([]);
      setTasks([]);
      setClients([]);
    } finally {
      setLoading(false);
      console.log('✅ Data loading sequence completed (success or failure)');
    }
  };

  const refreshData = () => {
    if (company?.id) {
      console.log('🔄 Manual data refresh requested...');
      loadAllData();
    } else {
      console.warn('⚠️ Cannot refresh data: no company ID available');
    }
  };

  return { refreshData };
};