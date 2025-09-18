import { useEffect } from 'react';
import { useStore } from '../store';
import { supabase } from '../lib/supabaseClient';
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

      const subscription = setupRealtimeSubscriptions(company.id);

      return () => {
        console.log(' unsubscribing from realtime updates');
        supabase.removeChannel(subscription);
      };
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

const setupRealtimeSubscriptions = (companyId: string) => {
  const { getState } = useStore;

  const handleProjectChange = (payload) => {
    console.log('Realtime change received for projects:', payload);
    switch (payload.eventType) {
      case 'INSERT':
        getState().data.addProject(payload.new);
        break;
      case 'UPDATE':
        getState().data.updateProject(payload.new.id, payload.new);
        break;
      case 'DELETE':
        getState().data.removeProject(payload.old.id);
        break;
    }
  };

  const handleTaskChange = (payload) => {
    console.log('Realtime change received for tasks:', payload);
    switch (payload.eventType) {
      case 'INSERT':
        getState().data.addTask(payload.new);
        break;
      case 'UPDATE':
        getState().data.updateTask(payload.new.id, payload.new);
        break;
      case 'DELETE':
        getState().data.removeTask(payload.old.id);
        break;
    }
  };

  const channel = supabase.channel(`public:tables`);
  channel
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projects_fos2025', filter: `company_id=eq.${companyId}` }, handleProjectChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks_fos2025' }, handleTaskChange) // Note: needs better filtering
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Subscribed to realtime updates');
      } else {
        console.log('Failed to subscribe to realtime updates:', status);
      }
    });

  return channel;
}