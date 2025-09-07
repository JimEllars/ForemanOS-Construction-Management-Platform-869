import { useEffect } from 'react';
import { useStore } from '../store';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { clientService } from '../services/clientService';
import { demoDataService } from '../services/demoDataService';

export const useSupabaseData = () => {
  const { user, company, isAuthenticated, setProjects, setTasks, setClients, setLoading } = useStore();

  useEffect(() => {
    if (isAuthenticated && company?.id) {
      loadAllData();
    }
  }, [isAuthenticated, company?.id]);

  const loadAllData = async () => {
    try {
      setLoading(true);

      // If it's the demo company, ensure demo data exists
      if (company?.id === 'demo-company-fos2025') {
        await demoDataService.ensureDemoDataExists();
      }

      // Load all data in parallel
      const [projects, tasks, clients] = await Promise.all([
        projectService.getProjectsByCompany(company.id),
        taskService.getTasksByCompany(company.id),
        clientService.getClientsByCompany(company.id)
      ]);

      setProjects(projects);
      setTasks(tasks);
      setClients(clients);

    } catch (error) {
      console.error('Error loading data:', error);
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