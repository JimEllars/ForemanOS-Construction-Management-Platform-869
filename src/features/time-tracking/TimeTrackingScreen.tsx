import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import CreateTimeEntryModal from '../../components/ui/CreateTimeEntryModal';
import { useStore } from '../../store';
import { timeTrackingService } from '../../services/timeTrackingService';
import { TimeEntry } from '../../types';

const { FiPlus, FiSearch, FiClock, FiPlay, FiPause, FiStop, FiCalendar, FiUser, FiEdit2, FiTrash2, FiActivity } = FiIcons;

const TimeTrackingScreen: React.FC = () => {
  const { company, user, timeEntries, setTimeEntries, addTimeEntry, updateTimeEntry, removeTimeEntry } = useStore();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [runningTimer, setRunningTimer] = useState<TimeEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  useEffect(() => {
    loadTimeEntries();
    loadStats();
    if (user?.id) {
      loadRunningTimer();
    }
  }, [company?.id, user?.id]);

  // Update elapsed time for running timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (runningTimer && runningTimer.is_running) {
      interval = setInterval(() => {
        const elapsed = timeTrackingService.calculateElapsedTime(runningTimer.start_time);
        setElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [runningTimer]);

  const loadTimeEntries = async () => {
    if (!company?.id) return;

    try {
      setLoading(true);
      console.log('⏱️ Loading time entries for company:', company.id);
      const entries = await timeTrackingService.getTimeEntriesByCompany(company.id);
      setTimeEntries(entries);
      console.log('✅ Time entries loaded:', entries.length);
    } catch (error) {
      console.error('❌ Failed to load time entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRunningTimer = async () => {
    if (!user?.id) return;

    try {
      const timer = await timeTrackingService.getRunningTimer(user.id);
      setRunningTimer(timer);
      if (timer) {
        const elapsed = timeTrackingService.calculateElapsedTime(timer.start_time);
        setElapsedTime(elapsed);
      }
    } catch (error) {
      console.error('❌ Failed to load running timer:', error);
    }
  };

  const loadStats = async () => {
    if (!company?.id) return;

    try {
      const timeStats = await timeTrackingService.getTimeTrackingStats(company.id, 30);
      setStats(timeStats);
    } catch (error) {
      console.error('❌ Failed to load time tracking stats:', error);
    }
  };

  const handleStartTimer = async (projectId?: string) => {
    if (projectId) {
      // Quick start timer for specific project
      if (!user?.id) return;
      
      try {
        const newTimer = await timeTrackingService.startTimer(projectId, null, user.id, 'Quick timer');
        setRunningTimer(newTimer);
        addTimeEntry(newTimer);
        await loadStats(); // Refresh stats
      } catch (error) {
        console.error('❌ Failed to start timer:', error);
        alert('Failed to start timer. Please try again.');
      }
    } else {
      // Show modal for detailed timer setup
      setShowTimerModal(true);
    }
  };

  const handleStopTimer = async (entryId: string) => {
    try {
      const updatedEntry = await timeTrackingService.stopTimer(entryId);
      setRunningTimer(null);
      updateTimeEntry(entryId, updatedEntry);
      await loadStats(); // Refresh stats
    } catch (error) {
      console.error('❌ Failed to stop timer:', error);
      alert('Failed to stop timer. Please try again.');
    }
  };

  const handleDeleteEntry = async (entry: TimeEntry) => {
    if (!confirm(`Are you sure you want to delete this time entry? This action cannot be undone.`)) {
      return;
    }

    setDeletingEntry(entry.id);
    try {
      await timeTrackingService.deleteTimeEntry(entry.id);
      removeTimeEntry(entry.id);
      
      // If this was the running timer, clear it
      if (runningTimer?.id === entry.id) {
        setRunningTimer(null);
      }
      
      await loadStats(); // Refresh stats
    } catch (error) {
      console.error('❌ Delete failed:', error);
      alert('Failed to delete time entry. Please try again.');
    } finally {
      setDeletingEntry(null);
    }
  };

  const filteredEntries = timeEntries.filter(entry => {
    const matchesSearch = 
      entry.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.task_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const entryDate = entry.start_time.split('T')[0];
    const matchesDate = !selectedDate || entryDate === selectedDate;
    const matchesProject = !selectedProject || entry.project_id === selectedProject;
    
    return matchesSearch && matchesDate && matchesProject;
  });

  const uniqueProjects = Array.from(new Set(timeEntries.map(entry => entry.project_id)))
    .map(projectId => {
      const entry = timeEntries.find(e => e.project_id === projectId);
      return { id: projectId, name: entry?.project_name || 'Unknown Project' };
    });

  const formatDuration = (hours: number | null) => {
    if (!hours) return '0h 0m';
    return timeTrackingService.formatDuration(hours);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-400">Loading time entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Time Tracking</h1>
          <p className="text-secondary-600 dark:text-secondary-400">Track work hours and project time</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowCreateModal(true)}>
            <SafeIcon icon={FiClock} className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
          <Button onClick={() => handleStartTimer()}>
            <SafeIcon icon={FiPlay} className="w-4 h-4 mr-2" />
            Start Timer
          </Button>
        </div>
      </div>

      {/* Running Timer Display */}
      {runningTimer && (
        <Card className="border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-primary-900 dark:text-primary-100">Timer Running</span>
                </div>
                <div>
                  <p className="text-sm text-primary-700 dark:text-primary-300">{runningTimer.project_name}</p>
                  {runningTimer.task_name && (
                    <p className="text-xs text-primary-600 dark:text-primary-400">{runningTimer.task_name}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                    {formatDuration(elapsedTime)}
                  </p>
                  <p className="text-xs text-primary-600 dark:text-primary-400">
                    Started at {formatTime(runningTimer.start_time)}
                  </p>
                </div>
                <Button 
                  onClick={() => handleStopTimer(runningTimer.id)}
                  variant="outline"
                  size="sm"
                >
                  <SafeIcon icon={FiStop} className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
                {stats ? formatDuration(stats.totalHours) : '0h 0m'}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Total Hours</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {stats?.activeTimers || 0}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Active Timers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                {stats?.totalEntries || 0}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Time Entries</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                {stats ? formatDuration(stats.averageSessionHours) : '0h 0m'}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Avg Session</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Panel */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SafeIcon icon={FiActivity} className="w-5 h-5 mr-2" />
              Time Tracking Insights (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-2">Most Active Project</h4>
                <p className="text-lg text-primary-600 dark:text-primary-400">
                  {stats.mostActiveProject || 'No data'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-2">Daily Average</h4>
                <p className="text-lg text-success-600 dark:text-success-400">
                  {formatDuration(stats.totalHours / 30)}
                </p>
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
            placeholder="Search by description, project, task, or user..."
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

      {/* Time Entries List */}
      <div className="space-y-4">
        {filteredEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`hover:shadow-md transition-shadow ${entry.is_running ? 'ring-2 ring-primary-500' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        entry.is_running ? 'bg-success-500 animate-pulse' : 'bg-secondary-300 dark:bg-secondary-600'
                      }`}></div>
                      <span className="text-sm text-secondary-600 dark:text-secondary-400">
                        {entry.is_running ? 'Running' : 'Completed'}
                      </span>
                      {entry.is_running && (
                        <span className="text-sm font-medium text-success-600 dark:text-success-400">
                          Live Timer
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg">{entry.project_name}</CardTitle>
                    {entry.task_name && (
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">{entry.task_name}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {entry.is_running ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleStopTimer(entry.id)}
                      >
                        <SafeIcon icon={FiStop} className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleStartTimer(entry.project_id)}
                      >
                        <SafeIcon icon={FiPlay} className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteEntry(entry)}
                      disabled={deletingEntry === entry.id}
                      className="p-2 text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-900"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                      <SafeIcon icon={FiClock} className="w-4 h-4 mr-2" />
                      <span className="font-medium">
                        {entry.is_running ? 'Duration:' : 'Total:'}
                      </span>
                      <span className="ml-1">
                        {entry.is_running ? 
                          formatDuration(timeTrackingService.calculateElapsedTime(entry.start_time)) : 
                          formatDuration(entry.duration_hours || 0)
                        }
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                      <SafeIcon icon={FiUser} className="w-4 h-4 mr-2" />
                      <span>{entry.user_name}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                      <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-2" />
                      <span>
                        {formatTime(entry.start_time)}
                        {entry.end_time && ` - ${formatTime(entry.end_time)}`}
                      </span>
                    </div>
                    <div className="text-sm text-secondary-600 dark:text-secondary-400">
                      {new Date(entry.start_time).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    {entry.description && (
                      <div>
                        <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-1 text-sm">Description</h4>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">{entry.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {entry.is_running && (
                  <div className="mt-4 p-3 bg-success-50 dark:bg-success-900 border border-success-200 dark:border-success-800 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-success-800 dark:text-success-200">
                        Timer running since {formatTime(entry.start_time)}
                      </span>
                      <span className="text-lg font-bold text-success-600 dark:text-success-400">
                        {formatDuration(timeTrackingService.calculateElapsedTime(entry.start_time))}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiClock} className="w-16 h-16 mx-auto text-secondary-300 dark:text-secondary-600 mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
            {searchTerm || selectedDate || selectedProject ? 'No time entries found' : 'No time entries yet'}
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            {searchTerm || selectedDate || selectedProject 
              ? 'Try adjusting your search terms or filters' 
              : 'Start tracking time to monitor project progress and labor costs'
            }
          </p>
          {!searchTerm && !selectedDate && !selectedProject && (
            <div className="space-x-2">
              <Button onClick={() => setShowCreateModal(true)} variant="outline">
                <SafeIcon icon={FiClock} className="w-4 h-4 mr-2" />
                Add Time Entry
              </Button>
              <Button onClick={() => handleStartTimer()}>
                <SafeIcon icon={FiPlay} className="w-4 h-4 mr-2" />
                Start Timer
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Time Entry Modal */}
      <CreateTimeEntryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEntryCreated={loadTimeEntries}
        startTimer={false}
      />

      {/* Start Timer Modal */}
      <CreateTimeEntryModal
        isOpen={showTimerModal}
        onClose={() => setShowTimerModal(false)}
        onEntryCreated={(entry) => {
          setRunningTimer(entry);
          loadTimeEntries();
        }}
        startTimer={true}
      />
    </div>
  );
};

export default TimeTrackingScreen;