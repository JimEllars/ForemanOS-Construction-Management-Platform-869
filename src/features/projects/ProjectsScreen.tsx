import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useStore } from '../../store';

const { FiPlus, FiSearch, FiCalendar, FiDollarSign } = FiIcons;

const ProjectsScreen: React.FC = () => {
  const { projects } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-700';
      case 'in_progress':
        return 'bg-primary-100 text-primary-700';
      case 'on_hold':
        return 'bg-warning-100 text-warning-700';
      default:
        return 'bg-secondary-100 text-secondary-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Projects</h1>
          <p className="text-secondary-600">Manage your construction projects</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-secondary-600 mb-4 line-clamp-2">
                  {project.description || 'No description provided'}
                </p>
                
                <div className="space-y-2">
                  {project.start_date && (
                    <div className="flex items-center text-sm text-secondary-500">
                      <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-2" />
                      Start: {new Date(project.start_date).toLocaleDateString()}
                    </div>
                  )}
                  
                  {project.budget && (
                    <div className="flex items-center text-sm text-secondary-500">
                      <SafeIcon icon={FiDollarSign} className="w-4 h-4 mr-2" />
                      Budget: ${project.budget.toLocaleString()}
                    </div>
                  )}
                </div>

                {project.syncStatus === 'pending' && (
                  <div className="mt-3 flex items-center text-xs text-warning-600">
                    <div className="w-2 h-2 bg-warning-500 rounded-full mr-2 animate-pulse"></div>
                    Syncing...
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiPlus} className="w-16 h-16 mx-auto text-secondary-300 mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No projects found</h3>
          <p className="text-secondary-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first project'}
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Project"
      >
        <div className="space-y-4">
          <Input label="Project Name" placeholder="Enter project name" />
          <Input label="Description" placeholder="Project description" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" />
            <Input label="Budget" type="number" placeholder="0" />
          </div>
          <div className="flex space-x-3">
            <Button className="flex-1">Create Project</Button>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectsScreen;