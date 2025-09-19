import { useEffect } from 'react';
import { useStore } from '../store';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { clientService } from '../services/clientService';
import { dailyLogService } from '../services/dailyLogService';
import { timeTrackingService } from '../services/timeTrackingService';

export const useSupabaseData = () => {
  const { 
    company, 
    user,
    isAuthenticated, 
    setProjects, 
    setTasks, 
    setClients, 
    setDailyLogs, 
    setTimeEntries,
    setRunningTimer,
    setLoading 
  } = useStore();

  useEffect(() => {
    // ✅ BYPASS: Skip real data loading when in bypass mode
    const BYPASS_AUTH = false; // Changed from true to false

    if (BYPASS_AUTH) {
      console.log('🔓 BYPASS MODE: Skipping real data loading, using mock data');
      setLoading(false);
      return;
    }

    // ✅ SIMPLIFIED: Only load supplementary data AFTER user is fully authenticated with company
    if (isAuthenticated && company?.id && user?.id) {
      console.log('🔄 User fully authenticated with company, loading dashboard data...');
      loadDashboardData();
    } else {
      console.log('⏸️ Waiting for full authentication:', { 
        isAuthenticated, 
        companyId: company?.id, 
        userId: user?.id 
      });
      
      // Reset data when not authenticated
      if (!isAuthenticated) {
        setProjects([]);
        setTasks([]);
        setClients([]);
        setDailyLogs([]);
        setTimeEntries([]);
        setRunningTimer(null);
        setLoading(false);
      }
    }
  }, [isAuthenticated, company?.id, user?.id]);

  const loadDashboardData = async () => {
    if (!company?.id || !user?.id) {
      console.warn('⚠️ Missing company ID or user ID for dashboard data loading');
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

      // Load tasks, clients, daily logs, and time entries in parallel
      console.log('📋 Step 2: Loading tasks, clients, daily logs, and time entries...');
      const [tasks, clients, dailyLogs, timeEntries] = await Promise.all([
        taskService.getTasksByCompany(company.id),
        clientService.getClientsByCompany(company.id),
        dailyLogService.getDailyLogsByCompany(company.id),
        timeTrackingService.getTimeEntriesByCompany(company.id)
      ]);

      setTasks(tasks);
      setClients(clients);
      setDailyLogs(dailyLogs);
      setTimeEntries(timeEntries);

      // Load running timer for current user
      console.log('⏱️ Step 3: Loading running timer...');
      const runningTimer = await timeTrackingService.getRunningTimer(user.id);
      setRunningTimer(runningTimer);

      console.log('🎉 All dashboard data loaded successfully');
      console.log('📊 Data summary:', {
        projects: projects.length,
        tasks: tasks.length,
        clients: clients.length,
        dailyLogs: dailyLogs.length,
        timeEntries: timeEntries.length,
        runningTimer: !!runningTimer
      });

    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      
      // ✅ GRACEFUL DEGRADATION: Set empty arrays on failure
      setProjects([]);
      setTasks([]);
      setClients([]);
      setDailyLogs([]);
      setTimeEntries([]);
      setRunningTimer(null);
      console.log('🔄 App will continue to work with empty data arrays');
    } finally {
      setLoading(false);
      console.log('✅ Dashboard data loading completed');
    }
  };

  const refreshData = () => {
    if (company?.id && user?.id) {
      console.log('🔄 Manual data refresh requested...');
      loadDashboardData();
    } else {
      console.warn('⚠️ Cannot refresh data: missing company ID or user ID');
    }
  };

  return { refreshData };
};