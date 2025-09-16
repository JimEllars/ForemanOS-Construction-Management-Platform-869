import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import CreateDailyLogModal from '../../components/ui/CreateDailyLogModal';
import EditDailyLogModal from '../../components/ui/EditDailyLogModal';
import { useStore } from '../../store';
import { dailyLogService } from '../../services/dailyLogService';
import { DailyLog } from '../../types';

const { FiPlus, FiSearch, FiCalendar, FiFileText, FiSun, FiCloud, FiCloudRain, FiEdit2, FiTrash2, FiTrendingUp, FiUsers, FiClock } = FiIcons;

const DailyLogsScreen: React.FC = () => {
  const { company, dailyLogs, setDailyLogs, removeDailyLog } = useStore();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);
  const [deletingLog, setDeletingLog] = useState<string | null>(null);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    loadDailyLogs();
    loadInsights();
  }, [company?.id]);

  const loadDailyLogs = async () => {
    if (!company?.id) return;

    try {
      setLoading(true);
      console.log('📋 Loading daily logs for company:', company.id);
      const logs = await dailyLogService.getDailyLogsByCompany(company.id);
      setDailyLogs(logs);
      console.log('✅ Daily logs loaded:', logs.length);
    } catch (error) {
      console.error('❌ Failed to load daily logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    if (!company?.id) return;

    try {
      const productivityInsights = await dailyLogService.getProductivityInsights(company.id, 30);
      setInsights(productivityInsights);
    } catch (error) {
      console.error('❌ Failed to load insights:', error);
    }
  };

  const filteredLogs = dailyLogs.filter(log => {
    const matchesSearch = 
      log.work_completed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !selectedDate || log.date === selectedDate;
    const matchesProject = !selectedProject || log.project_id === selectedProject;
    
    return matchesSearch && matchesDate && matchesProject;
  });

  const handleEditLog = (log: DailyLog) => {
    setSelectedLog(log);
    setShowEditModal(true);
  };

  const handleDeleteLog = async (log: DailyLog) => {
    if (!confirm(`Are you sure you want to delete the daily log for ${log.project_name} on ${new Date(log.date).toLocaleDateString()}? This action cannot be undone.`)) {
      return;
    }

    setDeletingLog(log.id);
    try {
      await dailyLogService.deleteDailyLog(log.id);
      removeDailyLog(log.id);
    } catch (error) {
      console.error('❌ Delete failed:', error);
      alert('Failed to delete daily log. Please try again.');
    } finally {
      setDeletingLog(null);
    }
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather?.toLowerCase()) {
      case 'sunny': return FiSun;
      case 'cloudy': return FiCloud;
      case 'rainy': return FiCloudRain;
      default: return FiSun;
    }
  };

  const getWeatherColor = (weather: string) => {
    switch (weather?.toLowerCase()) {
      case 'sunny': return 'text-yellow-500';
      case 'cloudy': return 'text-secondary-500 dark:text-secondary-400';
      case 'rainy': return 'text-blue-500';
      default: return 'text-yellow-500';
    }
  };

  const uniqueProjects = Array.from(new Set(dailyLogs.map(log => log.project_id)))
    .map(projectId => {
      const log = dailyLogs.find(l => l.project_id === projectId);
      return { id: projectId, name: log?.project_name || 'Unknown Project' };
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-400">Loading daily logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Daily Logs</h1>
          <p className="text-secondary-600 dark:text-secondary-400">Track daily progress and site conditions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
          New Daily Log
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{dailyLogs.length}</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Total Logs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {new Set(dailyLogs.map(log => log.date)).size}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Active Days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                {uniqueProjects.length}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                {insights?.weatherDelays || 0}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Weather Delays</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights Panel */}
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SafeIcon icon={FiTrendingUp} className="w-5 h-5 mr-2" />
              Productivity Insights (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <SafeIcon icon={FiClock} className="w-5 h-5 text-primary-600 mr-2" />
                  <span className="font-medium">Average Work Hours</span>
                </div>
                <p className="text-2xl font-bold text-primary-600">{insights.averageWorkHours}h</p>
                <p className="text-xs text-secondary-500">per day</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <SafeIcon icon={FiUsers} className="w-5 h-5 text-success-600 mr-2" />
                  <span className="font-medium">Most Active Project</span>
                </div>
                <p className="text-sm font-bold text-success-600 truncate">
                  {insights.mostActiveProject || 'No data'}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <SafeIcon icon={FiCloudRain} className="w-5 h-5 text-warning-600 mr-2" />
                  <span className="font-medium">Weather Impact</span>
                </div>
                <p className="text-2xl font-bold text-warning-600">{insights.weatherDelays}</p>
                <p className="text-xs text-secondary-500">delayed days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
          <Input
            placeholder="Search logs by work description, project, or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="sm:w-auto"
        />
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Projects</option>
          {uniqueProjects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      {/* Daily Logs List */}
      <div className="space-y-4">
        {filteredLogs.map((log, index) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <SafeIcon 
                        icon={getWeatherIcon(log.weather || 'sunny')} 
                        className={`w-5 h-5 ${getWeatherColor(log.weather || 'sunny')}`} 
                      />
                      <div className="flex items-center space-x-2 text-sm text-secondary-600 dark:text-secondary-400">
                        <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                        <span>{new Date(log.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="capitalize">{log.weather || 'sunny'}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{log.project_name}</CardTitle>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      Logged by {log.created_by_name} at {new Date(log.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditLog(log)}
                      className="p-2"
                    >
                      <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteLog(log)}
                      disabled={deletingLog === log.id}
                      className="p-2 text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-900"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-1">Work Completed</h4>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">{log.work_completed}</p>
                  </div>
                  {log.materials_used && (
                    <div>
                      <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-1">Materials Used</h4>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">{log.materials_used}</p>
                    </div>
                  )}
                  {log.crew_present && (
                    <div>
                      <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-1">Crew Present</h4>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">{log.crew_present}</p>
                    </div>
                  )}
                  {log.notes && (
                    <div>
                      <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-1">Notes</h4>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">{log.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiFileText} className="w-16 h-16 mx-auto text-secondary-300 dark:text-secondary-600 mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
            {searchTerm || selectedDate || selectedProject ? 'No logs found' : 'No daily logs yet'}
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            {searchTerm || selectedDate || selectedProject 
              ? 'Try adjusting your search terms or filters' 
              : 'Start documenting daily progress and site conditions'
            }
          </p>
          {!searchTerm && !selectedDate && !selectedProject && (
            <Button onClick={() => setShowCreateModal(true)}>
              <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
              Create Your First Daily Log
            </Button>
          )}
        </div>
      )}

      {/* Create Daily Log Modal */}
      <CreateDailyLogModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onLogCreated={loadDailyLogs}
      />

      {/* Edit Daily Log Modal */}
      <EditDailyLogModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedLog(null);
        }}
        dailyLog={selectedLog}
        onLogUpdated={loadDailyLogs}
      />
    </div>
  );
};

export default DailyLogsScreen;