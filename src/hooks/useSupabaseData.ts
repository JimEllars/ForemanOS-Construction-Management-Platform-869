import { useEffect } from 'react';
import { useStore } from '../store';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { clientService } from '../services/clientService';

export const useSupabaseData = () => {
  const { company, isAuthenticated, setProjects, setTasks, setClients, setLoading } = useStore();

  useEffect(() => {
    // ✅ SIMPLIFIED: Only load supplementary data AFTER user is fully authenticated with company
    if (isAuthenticated && company?.id) {
      console.log('🔄 User fully authenticated with company, loading dashboard data...');
      loadDashboardData();
    } else {
      console.log('⏸️ Waiting for full authentication:', { isAuthenticated, companyId: company?.id });
      
      // Reset data when not authenticated
      if (!isAuthenticated) {
        setProjects([]);
        setTasks([]);
        setClients([]);
        setLoading(false);
      }
    }
  }, [isAuthenticated, company?.id]);

  const loadDashboardData = async () => {
    if (!company?.id) {
      console.warn('⚠️ No company ID available for dashboard data loading');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Loading dashboard data for company:', company.id);

      // ✅ SEQUENTIAL LOADING: Load projects first, then tasks that depend on projects
      console.log('📋 Step 1: Loading projects...');
      const projects = await projectService.getProjectsByCompany(company.id);
      setProjects(projects);
      console.log('✅ Projects loaded:', projects.length);

      // Load tasks and clients in parallel (tasks now has projects available)
      console.log('📋 Step 2: Loading tasks and clients...');
      const [tasks, clients] = await Promise.all([
        taskService.getTasksByCompany(company.id),
        clientService.getClientsByCompany(company.id),
      ]);

      setTasks(tasks);
      setClients(clients);

      console.log('🎉 All dashboard data loaded successfully');
      console.log('📊 Data summary:', {
        projects: projects.length,
        tasks: tasks.length,
        clients: clients.length
      });

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      
      // ✅ GRACEFUL DEGRADATION: Set empty arrays on failure
      setProjects([]);
      setTasks([]);
      setClients([]);
      console.log('🔄 App will continue to work with empty data arrays');
      
    } finally {
      setLoading(false);
      console.log('✅ Dashboard data loading completed');
    }
  };

  const refreshData = () => {
    if (company?.id) {
      console.log('🔄 Manual data refresh requested...');
      loadDashboardData();
    } else {
      console.warn('⚠️ Cannot refresh data: no company ID available');
    }
  };

  return { refreshData };
};