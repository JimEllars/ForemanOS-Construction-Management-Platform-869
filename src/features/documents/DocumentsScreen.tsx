import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const { FiPlus, FiSearch, FiFile, FiImage, FiFileText, FiDownload, FiEye, FiTrash2, FiUpload, FiFolder } = FiIcons;

// Mock data for documents
const mockDocuments = [
  {
    id: 'doc-1',
    name: 'Site Plan - Downtown Office Building.pdf',
    type: 'pdf',
    size: '2.4 MB',
    project_id: 'proj-1',
    project_name: 'Downtown Office Building',
    category: 'plans',
    uploaded_by: 'John Smith',
    uploaded_at: '2024-01-20T10:30:00Z',
    url: '#'
  },
  {
    id: 'doc-2',
    name: 'Electrical Permit.pdf',
    type: 'pdf',
    size: '1.1 MB',
    project_id: 'proj-1',
    project_name: 'Downtown Office Building',
    category: 'permits',
    uploaded_by: 'Alex Chen',
    uploaded_at: '2024-01-18T14:15:00Z',
    url: '#'
  },
  {
    id: 'doc-3',
    name: 'Foundation Progress Photo.jpg',
    type: 'image',
    size: '3.2 MB',
    project_id: 'proj-1',
    project_name: 'Downtown Office Building',
    category: 'photos',
    uploaded_by: 'Mike Johnson',
    uploaded_at: '2024-01-22T16:45:00Z',
    url: '#'
  },
  {
    id: 'doc-4',
    name: 'Material Safety Data Sheet - Concrete.pdf',
    type: 'pdf',
    size: '856 KB',
    project_id: 'proj-2',
    project_name: 'Residential Complex Phase 1',
    category: 'safety',
    uploaded_by: 'Sarah Davis',
    uploaded_at: '2024-01-19T09:20:00Z',
    url: '#'
  },
  {
    id: 'doc-5',
    name: 'Survey Report.docx',
    type: 'document',
    size: '1.8 MB',
    project_id: 'proj-2',
    project_name: 'Residential Complex Phase 1',
    category: 'reports',
    uploaded_by: 'Lisa Brown',
    uploaded_at: '2024-01-21T11:30:00Z',
    url: '#'
  }
];

const DocumentsScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProject, setSelectedProject] = useState('');

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uploaded_by.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    const matchesProject = !selectedProject || doc.project_id === selectedProject;
    
    return matchesSearch && matchesCategory && matchesProject;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return FiImage;
      case 'pdf':
      case 'document':
        return FiFileText;
      default:
        return FiFile;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'text-blue-600 dark:text-blue-400';
      case 'pdf':
        return 'text-red-600 dark:text-red-400';
      case 'document':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-secondary-600 dark:text-secondary-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'plans':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'permits':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'photos':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'safety':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'reports':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-300';
    }
  };

  const totalSize = mockDocuments.reduce((sum, doc) => {
    const size = parseFloat(doc.size.replace(/[^\d.]/g, ''));
    const unit = doc.size.includes('MB') ? 1 : 0.001; // Convert KB to MB
    return sum + (size * unit);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Documents</h1>
          <p className="text-secondary-600 dark:text-secondary-400">Manage project documents, plans, and files</p>
        </div>
        <Button>
          <SafeIcon icon={FiUpload} className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{mockDocuments.length}</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Total Files</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{totalSize.toFixed(1)} MB</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Storage Used</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                {new Set(mockDocuments.map(doc => doc.category)).size}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Categories</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                {new Set(mockDocuments.map(doc => doc.project_id)).size}
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
            placeholder="Search documents by name or uploader..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Categories</option>
          <option value="plans">Plans</option>
          <option value="permits">Permits</option>
          <option value="photos">Photos</option>
          <option value="safety">Safety</option>
          <option value="reports">Reports</option>
        </select>
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

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <SafeIcon 
                      icon={getFileIcon(doc.type)} 
                      className={`w-8 h-8 ${getFileTypeColor(doc.type)} flex-shrink-0 mt-1`}
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm leading-tight break-words">{doc.name}</CardTitle>
                      <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1">{doc.project_name}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(doc.category)}`}>
                          {doc.category}
                        </span>
                        <span className="text-xs text-secondary-500 dark:text-secondary-400">{doc.size}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-xs text-secondary-600 dark:text-secondary-400">
                    <p>Uploaded by {doc.uploaded_by}</p>
                    <p>{new Date(doc.uploaded_at).toLocaleDateString()} at {new Date(doc.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <SafeIcon icon={FiEye} className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <SafeIcon icon={FiDownload} className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button variant="ghost" size="sm" className="p-2 text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-900">
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiFolder} className="w-16 h-16 mx-auto text-secondary-300 dark:text-secondary-600 mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
            {searchTerm || selectedCategory || selectedProject ? 'No documents found' : 'No documents yet'}
          </h3>
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            {searchTerm || selectedCategory || selectedProject 
              ? 'Try adjusting your search terms or filters' 
              : 'Upload plans, permits, photos, and other project documents'
            }
          </p>
          {!searchTerm && !selectedCategory && !selectedProject && (
            <Button>
              <SafeIcon icon={FiUpload} className="w-4 h-4 mr-2" />
              Upload Your First Document
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentsScreen;