import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import DataLoadingState from '../../components/ui/DataLoadingState';
import { useStore } from '../../store';
import { useSupabaseData } from '../../hooks/useSupabaseData';

const { FiFolderPlus, FiCheckSquare, FiUsers, FiClock, FiPlus, FiActivity } = FiIcons;

const DashboardScreen: React.FC = () => {
  const { 
    user, 
    company, 
    projects, 
    tasks, 
    clients, 
    isLoading, 
    isOnline,
    error 
  } = useStore();
  
  const { refreshData } = useSupabaseData();

  const stats = [
    {
      name: 'Active Projects',
      value: projects.filter(p => p.status === 'in_progress').length,
      total: projects.length,
      icon: FiFolderPlus,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
      description: `${projects.length} total projects`
    },
    {
      name: 'Pending Tasks',
      value: tasks.filter(t => t.status !== 'completed').length,
      total: tasks.length,
      icon: FiCheckSquare,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
      description: `${tasks.length} total tasks`
    },
    {
      name: 'Total Clients',
      value: clients.length,
      total: clients.length,
      icon: FiUsers,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
      description: 'Client relationships'
    },
    {
      name: 'Data Status',
      value: isOnline ? 'Online' : 'Offline',
      total: 1,
      icon: FiActivity,
      color: isOnline ? 'text-success-600' : 'text-warning-600',
      bgColor: isOnline ? 'bg-success-100' : 'bg-warning-100',
      description: isOnline ? 'Real-time sync' : 'Cached data'
    },
  ];

  const recentProjects = projects.slice(0, 3);
  const urgentTasks = tasks
    .filter(t => t.priority === 'high' && t.status !== 'completed')
    .slice(0, 3);

  return (
    <DataLoadingState 
      isLoading={isLoading} 
      isOnline={isOnline} 
      error={error}
      onRetry={refreshData}
      loadingMessage="Loading your dashboard data..."
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="mt-2 text-primary-100">
            {company?.name} - Your field operations are running smoothly.
          </p>
          <div className="mt-3 flex items-center space-x-4 text-sm text-primary-200">
            <span>📊 {projects.length} Projects</span>
            <span>✅ {tasks.length} Tasks</span>
            <span>👥 {clients.length} Clients</span>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-secondary-600">
                        {stat.name}
                      </p>
                      <p className="text-2xl font-bold text-secondary-900">
                        {stat.value}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {stat.description}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <SafeIcon icon={stat.icon} className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Projects</CardTitle>
                <Button size="sm" variant="outline">
                  <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.length > 0 ? (
                  recentProjects.map((project) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
                    >
                      <div>
                        <h4 className="font-medium text-secondary-900">
                          {project.name}
                        </h4>
                        <p className="text-sm text-secondary-600">
                          Status: {project.status.replace('_', ' ')}
                        </p>
                        {project.start_date && (
                          <p className="text-xs text-secondary-500">
                            Started: {new Date(project.start_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          project.status === 'completed'
                            ? 'bg-success-100 text-success-700'
                            : project.status === 'in_progress'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-secondary-100 text-secondary-700'
                        }`}
                      >
                        {project.status.replace('_', ' ')}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-secondary-500">
                    <SafeIcon icon={FiFolderPlus} className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
                    <p className="font-medium mb-1">No projects yet</p>
                    <p className="text-sm">Create your first project to get started!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Urgent Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>High Priority Tasks</CardTitle>
                <Button size="sm" variant="outline">
                  <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
                  New Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {urgentTasks.length > 0 ? (
                  urgentTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
                    >
                      <div>
                        <h4 className="font-medium text-secondary-900">
                          {task.title}
                        </h4>
                        <p className="text-sm text-secondary-600">
                          Priority: {task.priority} • Status: {task.status.replace('_', ' ')}
                        </p>
                        {task.due_date && (
                          <p className="text-xs text-secondary-500">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-danger-100 text-danger-700">
                        {task.priority}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-secondary-500">
                    <SafeIcon icon={FiCheckSquare} className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
                    <p className="font-medium mb-1">No urgent tasks</p>
                    <p className="text-sm">Great job staying on top of priorities!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Loading Success Indicator */}
        {!isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-secondary-500"
          >
            <div className="flex items-center justify-center space-x-2">
              <SafeIcon icon={FiActivity} className="w-4 h-4 text-success-500" />
              <span>Dashboard data loaded successfully</span>
              <span className="text-secondary-400">•</span>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </motion.div>
        )}
      </div>
    </DataLoadingState>
  );
};

export default DashboardScreen;