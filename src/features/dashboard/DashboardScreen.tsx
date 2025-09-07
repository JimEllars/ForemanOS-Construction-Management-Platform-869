import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store';

const { FiFolderPlus, FiCheckSquare, FiUsers, FiClock, FiPlus } = FiIcons;

const DashboardScreen: React.FC = () => {
  const { user, company, projects, tasks, clients } = useStore();

  const stats = [
    {
      name: 'Active Projects',
      value: projects.filter(p => p.status === 'in_progress').length,
      icon: FiFolderPlus,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      name: 'Pending Tasks',
      value: tasks.filter(t => t.status !== 'completed').length,
      icon: FiCheckSquare,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100',
    },
    {
      name: 'Total Clients',
      value: clients.length,
      icon: FiUsers,
      color: 'text-success-600',
      bgColor: 'bg-success-100',
    },
    {
      name: 'Hours This Week',
      value: '32.5',
      icon: FiClock,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
    },
  ];

  const recentProjects = projects.slice(0, 3);
  const urgentTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="mt-2 text-primary-100">
          {company?.name} - Let's manage your field operations efficiently.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600">{stat.name}</p>
                    <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
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
                  <div key={project.id} className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-secondary-900">{project.name}</h4>
                      <p className="text-sm text-secondary-600">Status: {project.status}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      project.status === 'completed' ? 'bg-success-100 text-success-700' :
                      project.status === 'in_progress' ? 'bg-primary-100 text-primary-700' :
                      'bg-secondary-100 text-secondary-700'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-secondary-500">
                  <SafeIcon icon={FiFolderPlus} className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
                  <p>No projects yet. Create your first project!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Urgent Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Urgent Tasks</CardTitle>
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
                  <div key={task.id} className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-secondary-900">{task.title}</h4>
                      <p className="text-sm text-secondary-600">Priority: {task.priority}</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-danger-100 text-danger-700">
                      {task.priority}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-secondary-500">
                  <SafeIcon icon={FiCheckSquare} className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
                  <p>No urgent tasks. Great job!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardScreen;