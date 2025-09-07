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
      console.log('🔄 Starting data load for company:', company.id);
      setLoading(true);

      // Load all data in parallel with individual error handling
      const results = await Promise.allSettled([
        projectService.getProjectsByCompany(company.id),
        taskService.getTasksByCompany(company.id),
        clientService.getClientsByCompany(company.id)
      ]);

      // Process results individually to prevent one failure from breaking everything
      const [projectsResult, tasksResult, clientsResult] = results;

      if (projectsResult.status === 'fulfilled') {
        setProjects(projectsResult.value);
        console.log('✅ Projects loaded:', projectsResult.value.length);
      } else {
        console.error('❌ Failed to load projects:', projectsResult.reason);
        setProjects([]); // Set empty array instead of leaving undefined
      }

      if (tasksResult.status === 'fulfilled') {
        setTasks(tasksResult.value);
        console.log('✅ Tasks loaded:', tasksResult.value.length);
      } else {
        console.error('❌ Failed to load tasks:', tasksResult.reason);
        setTasks([]); // Set empty array instead of leaving undefined
      }

      if (clientsResult.status === 'fulfilled') {
        setClients(clientsResult.value);
        console.log('✅ Clients loaded:', clientsResult.value.length);
      } else {
        console.error('❌ Failed to load clients:', clientsResult.reason);
        setClients([]); // Set empty array instead of leaving undefined
      }

      console.log('🎉 Data loading completed');
    } catch (error) {
      console.error('❌ Critical error loading data:', error);
      // Ensure we still set empty arrays to prevent undefined states
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