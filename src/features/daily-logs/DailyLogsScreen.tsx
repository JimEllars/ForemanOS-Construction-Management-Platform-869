import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const { FiPlus, FiSearch, FiCalendar, FiFileText, FiSun, FiCloud, FiCloudRain, FiEdit2, FiTrash2 } = FiIcons;

// Mock data for daily logs
const mockDailyLogs = [
  {
    id: 'log-1',
    project_id: 'proj-1',
    project_name: 'Downtown Office Building',
    date: '2024-01-22',
    weather: 'sunny',
    work_completed: 'Completed foundation excavation on the north side. Poured concrete for footings sections A-C. Installed rebar for sections D-F.',
    materials_used: '15 cubic yards concrete, 2 tons rebar steel, 50 bags cement',
    crew_present: 'John Smith (Foreman), Mike Johnson (Operator), Sarah Davis (Laborer), Tom Wilson (Laborer)',
    notes: 'Weather conditions were perfect for concrete work. No delays encountered. Equipment running smoothly.',
    created_by: 'John Smith',
    created_at: '2024-01-22T17:30:00Z',
    updated_at: '2024-01-22T17:30:00Z'
  },
  {
    id: 'log-2',
    project_id: 'proj-2',
    project_name: 'Residential Complex Phase 1',
    date: '2024-01-22',
    weather: 'cloudy',
    work_completed: 'Site survey completed. Marked utility lines and property boundaries. Set up temporary fencing around perimeter.',
    materials_used: 'Survey stakes, flagging tape, temporary fencing materials',
    crew_present: 'Lisa Brown (Surveyor), Carlos Rodriguez (Assistant), Dave Miller (Laborer)',
    notes: 'Discovered underground cable not shown on original plans. Need to contact utility company before proceeding.',
    created_by: 'Lisa Brown',
    created_at: '2024-01-22T16:45:00Z',
    updated_at: '2024-01-22T16:45:00Z'
  },
  {
    id: 'log-3',
    project_id: 'proj-1',
    project_name: 'Downtown Office Building',
    date: '2024-01-21',
    weather: 'rainy',
    work_completed: 'Indoor electrical rough-in work continued. Installed conduit runs for floors 2-3. Pulled wire for lighting circuits.',
    materials_used: '500ft EMT conduit, 1200ft 12AWG wire, junction boxes, wire nuts',
    crew_present: 'Alex Chen (Electrician), Maria Garcia (Apprentice)',
    notes: 'Rain prevented outdoor work. Focused on interior electrical. Behind schedule due to weather delays.',
    created_by: 'Alex Chen',
    created_at: '2024-01-21T15:20:00Z',
    updated_at: '2024-01-21T15:20:00Z'
  }
];

const DailyLogsScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  const filteredLogs = mockDailyLogs.filter(log => {
    const matchesSearch = 
      log.work_completed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.created_by.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !selectedDate || log.date === selectedDate;
    const matchesProject = !selectedProject || log.project_id === selectedProject;
    
    return matchesSearch && matchesDate && matchesProject;
  });

  const getWeatherIcon = (weather: string) => {
    switch (weather?.toLowerCase()) {
      case 'sunny':
        return FiSun;
      case 'cloudy':
        return FiCloud;
      case 'rainy':
        return FiCloudRain;
      default:
        return FiSun;
    }
  };

  const getWeatherColor = (weather: string) => {
    switch (weather?.toLowerCase()) {
      case 'sunny':
        return 'text-yellow-500';
      case 'cloudy':
        return 'text-secondary-500 dark:text-secondary-400';
      case 'rainy':
        return 'text-blue-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Daily Logs</h1>
          <p className="text-secondary-600 dark:text-secondary-400">Track daily progress and site conditions</p>
        </div>
        <Button>
          <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
          New Daily Log
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{mockDailyLogs.length}</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Total Logs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {new Set(mockDailyLogs.map(log => log.date)).size}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Active Days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                {new Set(mockDailyLogs.map(log => log.project_id)).size}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                {mockDailyLogs.filter(log => log.weather === 'rainy').length}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Weather Delays</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
          <option value="proj-1">Downtown Office Building</option>
          <option value="proj-2">Residential Complex Phase 1</option>
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
                        icon={getWeatherIcon(log.weather)} 
                        className={`w-5 h-5 ${getWeatherColor(log.weather)}`} 
                      />
                      <div className="flex items-center space-x-2 text-sm text-secondary-600 dark:text-secondary-400">
                        <SafeIcon icon={FiCalendar} className="w-4 h-4" />
                        <span>{new Date(log.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{log.weather}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{log.project_name}</CardTitle>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      Logged by {log.created_by} at {new Date(log.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" className="p-2">
                      <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-900">
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
            <Button>
              <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
              Create Your First Daily Log
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyLogsScreen;