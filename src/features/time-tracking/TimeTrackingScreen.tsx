import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const { FiPlus, FiSearch, FiClock, FiPlay, FiPause, FiStop, FiCalendar, FiUser, FiEdit2, FiTrash2 } = FiIcons;

// Mock data for time entries
const mockTimeEntries = [
  {
    id: 'time-1',
    project_id: 'proj-1',
    project_name: 'Downtown Office Building',
    task_name: 'Foundation Excavation',
    user_name: 'John Smith',
    start_time: '2024-01-22T08:00:00Z',
    end_time: '2024-01-22T12:00:00Z',
    duration: 4.0, // hours
    description: 'Excavated north foundation area, prepared for concrete pour',
    is_running: false,
    created_at: '2024-01-22T08:00:00Z'
  },
  {
    id: 'time-2',
    project_id: 'proj-1',
    project_name: 'Downtown Office Building',
    task_name: 'Electrical Rough-in',
    user_name: 'Alex Chen',
    start_time: '2024-01-22T13:00:00Z',
    end_time: '2024-01-22T17:30:00Z',
    duration: 4.5,
    description: 'Installed conduit runs for second floor lighting',
    is_running: false,
    created_at: '2024-01-22T13:00:00Z'
  },
  {
    id: 'time-3',
    project_id: 'proj-2',
    project_name: 'Residential Complex Phase 1',
    task_name: 'Site Survey',
    user_name: 'Lisa Brown',
    start_time: '2024-01-22T09:00:00Z',
    end_time: null,
    duration: 0,
    description: 'Conducting topographical survey',
    is_running: true,
    created_at: '2024-01-22T09:00:00Z'
  }
];

const TimeTrackingScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  const filteredEntries = mockTimeEntries.filter(entry => {
    const matchesSearch = 
      entry.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const entryDate = new Date(entry.start_time).toISOString().split('T')[0];
    const matchesDate = !selectedDate || entryDate === selectedDate;
    const matchesProject = !selectedProject || entry.project_id === selectedProject;
    
    return matchesSearch && matchesDate && matchesProject;
  });

  const totalHours = filteredEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const activeTimers = mockTimeEntries.filter(entry => entry.is_running).length;

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleStartTimer = (entryId: string) => {
    console.log('Starting timer for entry:', entryId);
    // Implementation would update the entry to start tracking time
  };

  const handlePauseTimer = (entryId: string) => {
    console.log('Pausing timer for entry:', entryId);
    // Implementation would pause the running timer
  };

  const handleStopTimer = (entryId: string) => {
    console.log('Stopping timer for entry:', entryId);
    // Implementation would stop and save the time entry
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Time Tracking</h1>
          <p className="text-secondary-600 dark:text-secondary-400">Track work hours and project time</p>
        </div>
        <Button>
          <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
          Start New Timer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{formatDuration(totalHours)}</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Total Hours</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{activeTimers}</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Active Timers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600 dark:text-success-400">{mockTimeEntries.length}</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Time Entries</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                {new Set(mockTimeEntries.map(entry => entry.project_id)).size}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Projects</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
          <Input
            placeholder="Search by task, project, or user..."
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
          <option value="proj-1">Downtown Office Building</option>
          <option value="proj-2">Residential Complex Phase 1</option>
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
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${entry.is_running ? 'bg-success-500 animate-pulse' : 'bg-secondary-300 dark:bg-secondary-600'}`}></div>
                      <span className="text-sm text-secondary-600 dark:text-secondary-400">
                        {entry.is_running ? 'Running' : 'Completed'}
                      </span>
                      {entry.is_running && (
                        <span className="text-sm font-medium text-success-600 dark:text-success-400">
                          Live Timer
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg">{entry.task_name}</CardTitle>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">{entry.project_name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {entry.is_running ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handlePauseTimer(entry.id)}>
                          <SafeIcon icon={FiPause} className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleStopTimer(entry.id)}>
                          <SafeIcon icon={FiStop} className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleStartTimer(entry.id)}>
                          <SafeIcon icon={FiPlay} className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2">
                          <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-2 text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-900">
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                      <SafeIcon icon={FiClock} className="w-4 h-4 mr-2" />
                      <span className="font-medium">
                        {entry.is_running ? 'Started:' : 'Duration:'}
                      </span>
                      <span className="ml-1">
                        {entry.is_running ? formatTime(entry.start_time) : formatDuration(entry.duration)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                      <SafeIcon icon={FiUser} className="w-4 h-4 mr-2" />
                      <span>{entry.user_name}</span>
                    </div>
                  </div>
                  
                  {!entry.is_running && (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-secondary-600 dark:text-secondary-400">
                        <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-2" />
                        <span>
                          {formatTime(entry.start_time)} - {entry.end_time ? formatTime(entry.end_time) : 'Running'}
                        </span>
                      </div>
                      <div className="text-sm text-secondary-600 dark:text-secondary-400">
                        {new Date(entry.start_time).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  
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
                        {/* This would show live elapsed time */}
                        2h 15m
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
            <Button>
              <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
              Start Your First Timer
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeTrackingScreen;