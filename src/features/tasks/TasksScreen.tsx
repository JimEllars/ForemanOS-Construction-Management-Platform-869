import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import CreateTaskModal from './CreateTaskModal';
import EditTaskModal from './EditTaskModal';
import { useStore } from '../../store';
import { taskService } from '../../services/taskService';
import { Task } from '../../types';

const { FiPlus, FiSearch, FiCalendar, FiUser, FiEdit2, FiTrash2, FiCheckSquare, FiClock, FiAlertCircle } = FiIcons;

const TasksScreen: React.FC = () => {
  const { tasks, projects, removeTask } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<string | null>(null);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300';
      case 'in_progress':
        return 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300';
      case 'todo':
        return 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-300';
      default:
        return 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-danger-600 dark:text-danger-400';
      case 'medium':
        return 'text-warning-600 dark:text-warning-400';
      case 'low':
        return 'text-success-600 dark:text-success-400';
      default:
        return 'text-secondary-500 dark:text-secondary-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return FiAlertCircle;
      case 'medium':
        return FiClock;
      case 'low':
        return FiCheckSquare;
      default:
        return FiCheckSquare;
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleDeleteTask = async (task: Task) => {
    if (!confirm(`Are you sure you want to delete "${task.title}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingTask(task.id);
    try {
      await taskService.deleteTask(task.id);
      removeTask(task.id);
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    } finally {
      setDeletingTask(null);
    }
  };

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    highPriority: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Tasks</h1>
          <p className="text-secondary-600 dark:text-secondary-400">Manage and track project tasks</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{taskStats.total}</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Total Tasks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-700 dark:text-secondary-300">{taskStats.todo}</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">To Do</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{taskStats.inProgress}</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600 dark:text-success-400">{taskStats.completed}</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-danger-600 dark:text-danger-400">{taskStats.highPriority}</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">High Priority</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
          <Input
            placeholder="Search tasks by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Priority</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <SafeIcon 
                        icon={getPriorityIcon(task.priority)} 
                        className={`w-4 h-4 ${getPriorityColor(task.priority)}`} 
                      />
                      <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                    </div>
                    <CardTitle className="text-lg leading-tight">{task.title}</CardTitle>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                      {getProjectName(task.project_id)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTask(task)}
                      className="p-2"
                    >
                      <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTask(task)}
                      disabled={deletingTask === task.id}
                      className="p-2 text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-900"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {task.description && (
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    
                    {task.due_date && (
                      <div className="flex items-center text-xs text-secondary-500 dark:text-secondary-400">
                        <SafeIcon icon={FiCalendar} className="w-3 h-3 mr-1" />
                        {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {task.assigned_to && (
                    <div className="flex items-center text-xs text-secondary-500 dark:text-secondary-400">
                      <SafeIcon icon={FiUser} className="w-3 h-3 mr-1" />
                      Assigned to: {task.assigned_to}
                    </div>
                  )}
                </div>

                {task.syncStatus === 'pending' && (
                  <div className="mt-3 flex items-center text-xs text-warning-600 dark:text-warning-400">
                    <div className="w-2 h-2 bg-warning-500 rounded-full mr-2 animate-pulse"></div>
                    Syncing...
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiCheckSquare} className="w-16 h-16 mx-auto text-secondary-300 dark:text-secondary-600 mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' ? 'No tasks found' : 'No tasks yet'}
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
              ? 'Try adjusting your search terms or filters' 
              : 'Create your first task to get started'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
            <Button onClick={() => setShowCreateModal(true)}>
              <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
              Create Your First Task
            </Button>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </div>
  );
};

export default TasksScreen;