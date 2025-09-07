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

      // Step 1: Fetch clients (can be done in parallel as it's independent)
      const clientsPromise = clientService.getClientsByCompany(company.id);

      // Step 2: Fetch projects first, as tasks depend on them
      console.log('📋 Loading projects first...');
      const projects = await projectService.getProjectsByCompany(company.id);
      setProjects(projects);
      console.log('✅ Projects loaded:', projects.length);

      // Step 3: Now that projects are loaded, fetch tasks
      console.log('📋 Loading tasks (depends on projects)...');
      const tasks = await taskService.getTasksByCompany(company.id);
      setTasks(tasks);
      console.log('✅ Tasks loaded:', tasks.length);

      // Step 4: Await and set clients (this was running in parallel)
      console.log('📋 Loading clients...');
      const clients = await clientsPromise;
      setClients(clients);
      console.log('✅ Clients loaded:', clients.length);

      console.log('🎉 All data loading completed successfully');

    } catch (error) {
      console.error('❌ Critical error loading data:', error);
      // Set all data to empty arrays on failure to prevent a broken state
      setProjects([]);
      setTasks([]);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    if (company?.id) {
      loadAllData();
    }
  };

  return { refreshData };
};