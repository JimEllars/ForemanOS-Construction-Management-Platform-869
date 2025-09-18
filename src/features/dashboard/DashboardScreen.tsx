import React from 'react';
import { useStore } from '../../store';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import DataLoadingState from '../../components/ui/DataLoadingState';
import StatCard from './StatCard';
import ProjectStatusChart from './ProjectStatusChart';
import RecentActivityFeed from './RecentActivityFeed';
import * as FiIcons from 'react-icons/fi';

const { FiFolderPlus, FiCheckSquare, FiUsers, FiAlertTriangle } = FiIcons;

const DashboardScreen: React.FC = () => {
  const { 
    user, 
    projects, 
    tasks, 
    clients, 
    isLoading, 
    isOnline,
    error 
  } = useStore(state => ({
    user: state.auth.user,
    projects: state.data.projects,
    tasks: state.data.tasks,
    clients: state.data.clients,
    isLoading: state.data.isLoading,
    isOnline: state.offline.isOnline,
    error: state.auth.error,
  }));
  
  const { refreshData } = useSupabaseData();

  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;

  return (
    <DataLoadingState 
      isLoading={isLoading} 
      isOnline={isOnline} 
      error={error}
      onRetry={refreshData}
      loadingMessage="Loading your dashboard..."
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-1">
            Here's your snapshot for today.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <ProjectStatusChart />
            <RecentActivityFeed />
          </div>

          {/* Right Column (Stat Cards) */}
          <div className="space-y-6">
            <StatCard
              title="Active Projects"
              value={activeProjects}
              icon={FiFolderPlus}
              href="/app/projects?filter=in_progress"
            />
            <StatCard
              title="Total Clients"
              value={clients.length}
              icon={FiUsers}
              href="/app/clients"
            />
            <StatCard
              title="Pending Tasks"
              value={pendingTasks}
              icon={FiCheckSquare}
              href="/app/tasks?filter=pending"
            />
            <StatCard
              title="Overdue Tasks"
              value={overdueTasks}
              icon={FiAlertTriangle}
              changeType={overdueTasks > 0 ? 'decrease' : undefined}
              href="/app/tasks?filter=overdue"
            />
          </div>

        </div>
      </div>
    </DataLoadingState>
  );
};

export default DashboardScreen;