import { useEffect } from 'react';
import { useStore } from '../store';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { clientService } from '../services/clientService';

export const useSupabaseData = () => {
  const { 
    company, 
    isAuthenticated, 
    setProjects, 
    setTasks, 
    setClients, 
    setLoading 
  } = useStore();

  useEffect(() => {
    // ✅ SIMPLIFIED: Only load supplementary data if user is fully authenticated and has company
    if (isAuthenticated && company?.id) {
      console.log('🔄 User is authenticated with company, loading supplementary data...');
      loadSupplementaryData();
    } else {
      console.log('⏸️ User not ready for data loading:', {
        isAuthenticated,
        companyId: company?.id
      });
      
      // Reset data when not authenticated
      if (!isAuthenticated) {
        setProjects([]);
        setTasks([]);
        setClients([]);
        setLoading(false);
      }
    }
  }, [isAuthenticated, company?.id]);

  const loadSupplementaryData = async () => {
    if (!company?.id) {
      console.warn('⚠️ No company ID available for supplementary data loading');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Loading supplementary data (projects, tasks, clients) for company:', company.id);

      // ✅ OPTIMIZED: Load all supplementary data in parallel since login already loaded critical data
      const [projects, tasks, clients] = await Promise.all([
        projectService.getProjectsByCompany(company.id),
        taskService.getTasksByCompany(company.id),
        clientService.getClientsByCompany(company.id),
      ]);

      setProjects(projects);
      setTasks(tasks);
      setClients(clients);

      console.log('🎉 All supplementary data loaded successfully');
      console.log('📊 Data summary:', {
        projects: projects.length,
        tasks: tasks.length,
        clients: clients.length
      });

    } catch (error) {
      console.error('❌ Failed to load supplementary data:', error);
      
      // ✅ GRACEFUL DEGRADATION: Set empty arrays on failure
      setProjects([]);
      setTasks([]);
      setClients([]);
      
      console.log('🔄 App will continue to work with empty data arrays');

    } finally {
      setLoading(false);
      console.log('✅ Supplementary data loading completed');
    }
  };

  const refreshData = () => {
    if (company?.id) {
      console.log('🔄 Manual data refresh requested...');
      loadSupplementaryData();
    } else {
      console.warn('⚠️ Cannot refresh data: no company ID available');
    }
  };

  return { refreshData };
};