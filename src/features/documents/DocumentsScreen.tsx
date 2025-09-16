import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import FileUpload from '../../components/ui/FileUpload';
import { useStore } from '../../store';
import { documentService } from '../../services/documentService';
import { Document } from '../../types';

const { FiPlus, FiSearch, FiFile, FiImage, FiFileText, FiDownload, FiEye, FiTrash2, FiUpload, FiFolder, FiGrid, FiList } = FiIcons;

const DocumentsScreen: React.FC = () => {
  const { company, user, projects } = useStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProjectId, setUploadProjectId] = useState('');
  const [deletingDocument, setDeletingDocument] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [company?.id]);

  const loadDocuments = async () => {
    if (!company?.id) return;

    try {
      setLoading(true);
      console.log('📁 Loading documents for company:', company.id);
      const docs = await documentService.getDocumentsByCompany(company.id);
      setDocuments(docs);
      console.log('✅ Documents loaded:', docs.length);
    } catch (error) {
      console.error('❌ Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.uploaded_by_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.project_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || doc.category === selectedCategory;
    const matchesProject = !selectedProject || doc.project_id === selectedProject;
    
    return matchesSearch && matchesCategory && matchesProject;
  });

  const handleUploadFiles = async (files: File[]) => {
    if (!user?.id || !uploadProjectId) {
      throw new Error('Missing user or project information');
    }

    try {
      console.log('📤 Uploading files:', files.length);
      
      // Upload files sequentially to avoid overwhelming the server
      for (const file of files) {
        await documentService.uploadDocument(file, uploadProjectId, user.id);
      }

      console.log('✅ All files uploaded successfully');
      
      // Reload documents and close modal
      await loadDocuments();
      setShowUploadModal(false);
      setUploadProjectId('');
      
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      throw error;
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      console.log('⬇️ Downloading document:', document.name);
      const downloadUrl = await documentService.getDocumentDownloadUrl(document.storage_path);
      
      // Create a temporary link and trigger download
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = document.name;
      link.click();
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleView = async (document: Document) => {
    try {
      console.log('👀 Viewing document:', document.name);
      const viewUrl = await documentService.getDocumentDownloadUrl(document.storage_path);
      
      // Open in new tab
      window.open(viewUrl, '_blank');
      
    } catch (error) {
      console.error('❌ View failed:', error);
      alert('Failed to view file. Please try again.');
    }
  };

  const handleDelete = async (document: Document) => {
    if (!confirm(`Are you sure you want to delete "${document.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingDocument(document.id);
    try {
      await documentService.deleteDocument(document.id);
      await loadDocuments();
    } catch (error) {
      console.error('❌ Delete failed:', error);
      alert('Failed to delete document. Please try again.');
    } finally {
      setDeletingDocument(null);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return FiImage;
      case 'pdf':
      case 'document':
        return FiFileText;
      default:
        return FiFile;
    }
  };

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return 'text-blue-600 dark:text-blue-400';
      case 'pdf':
        return 'text-red-600 dark:text-red-400';
      case 'document':
        return 'text-blue-600 dark:text-blue-400';
      case 'spreadsheet':
        return 'text-green-600 dark:text-green-400';
      case 'cad':
        return 'text-purple-600 dark:text-purple-400';
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
      case 'contracts':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';
      default:
        return 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-300';
    }
  };

  const totalSize = documents.reduce((sum, doc) => sum + doc.size_bytes, 0);
  const categories = Array.from(new Set(documents.map(doc => doc.category)));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 dark:text-secondary-400">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Documents</h1>
          <p className="text-secondary-600 dark:text-secondary-400">Manage project documents, plans, and files</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <SafeIcon icon={FiUpload} className="w-4 h-4 mr-2" />
          Upload Documents
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{documents.length}</p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Total Files</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {documentService.formatFileSize(totalSize)}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Storage Used</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600 dark:text-success-400">
                {categories.length}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Categories</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-warning-600 dark:text-warning-400">
                {new Set(documents.map(doc => doc.project_id)).size}
              </p>
              <p className="text-sm text-secondary-600 dark:text-secondary-400">Projects</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
            <Input
              placeholder="Search documents by name, uploader, or project..."
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
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex border border-secondary-300 dark:border-secondary-600 rounded-md">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' 
              ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
              : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
            }`}
          >
            <SafeIcon icon={FiGrid} className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' 
              ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' 
              : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
            }`}
          >
            <SafeIcon icon={FiList} className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Documents Display */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <SafeIcon 
                        icon={getFileIcon(doc.file_type)} 
                        className={`w-8 h-8 ${getFileTypeColor(doc.file_type)} flex-shrink-0 mt-1`}
                      />
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm leading-tight break-words line-clamp-2">
                          {doc.name}
                        </CardTitle>
                        <p className="text-xs text-secondary-600 dark:text-secondary-400 mt-1 truncate">
                          {doc.project_name}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(doc.category)}`}>
                        {doc.category}
                      </span>
                      <span className="text-xs text-secondary-500 dark:text-secondary-400">
                        {doc.size_display}
                      </span>
                    </div>
                    
                    <div className="text-xs text-secondary-600 dark:text-secondary-400">
                      <p>By {doc.uploaded_by_name}</p>
                      <p>{new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleView(doc)} className="flex-1 text-xs">
                        <SafeIcon icon={FiEye} className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)} className="flex-1 text-xs">
                        <SafeIcon icon={FiDownload} className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(doc)}
                        disabled={deletingDocument === doc.id}
                        className="p-2 text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-900"
                      >
                        <SafeIcon icon={FiTrash2} className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filteredDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <Card className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <SafeIcon 
                        icon={getFileIcon(doc.file_type)} 
                        className={`w-6 h-6 ${getFileTypeColor(doc.file_type)} flex-shrink-0`}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-secondary-900 dark:text-secondary-100 truncate">
                          {doc.name}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-secondary-600 dark:text-secondary-400">
                          <span>{doc.project_name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(doc.category)}`}>
                            {doc.category}
                          </span>
                          <span>{doc.size_display}</span>
                          <span>By {doc.uploaded_by_name}</span>
                          <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => handleView(doc)}>
                        <SafeIcon icon={FiEye} className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}>
                        <SafeIcon icon={FiDownload} className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(doc)}
                        disabled={deletingDocument === doc.id}
                        className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-900"
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

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
            <Button onClick={() => setShowUploadModal(true)}>
              <SafeIcon icon={FiUpload} className="w-4 h-4 mr-2" />
              Upload Your First Document
            </Button>
          )}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setUploadProjectId('');
        }}
        title="Upload Documents"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
              Select Project
            </label>
            <select
              value={uploadProjectId}
              onChange={(e) => setUploadProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Choose a project...</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {uploadProjectId && (
            <FileUpload
              onFileSelect={() => {}} // Files are handled in onUpload
              onUpload={handleUploadFiles}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf"
              multiple={true}
              maxSize={50}
              maxFiles={10}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default DocumentsScreen;