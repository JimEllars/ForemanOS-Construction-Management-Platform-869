import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { Button } from './Button';

const { FiUpload, FiFile, FiX, FiCheck, FiAlertCircle } = FiIcons;

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onUpload,
  accept = '*/*',
  multiple = true,
  maxSize = 50, // 50MB default
  maxFiles = 10,
  className = '',
  disabled = false
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File "${file.name}" is too large. Maximum size is ${maxSize}MB.`;
    }

    // Check file type if accept is specified and not wildcard
    if (accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type;
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

      const isAccepted = acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
          return acceptedType === fileExtension;
        }
        return fileType.match(acceptedType.replace('*', '.*'));
      });

      if (!isAccepted) {
        return `File "${file.name}" type is not supported.`;
      }
    }

    return null;
  };

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    // Validate each file
    newFiles.forEach(file => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    // Check total file count
    if (selectedFiles.length + validFiles.length > maxFiles) {
      validationErrors.push(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    // Check for duplicates
    const duplicates = validFiles.filter(file => 
      selectedFiles.some(existing => existing.name === file.name)
    );

    if (duplicates.length > 0) {
      validationErrors.push(`Duplicate files: ${duplicates.map(f => f.name).join(', ')}`);
    }

    setErrors(validationErrors);

    if (validFiles.length > 0 && duplicates.length === 0) {
      const updatedFiles = [...selectedFiles, ...validFiles];
      setSelectedFiles(updatedFiles);
      onFileSelect(updatedFiles);
    }
  }, [selectedFiles, maxFiles, maxSize, accept, onFileSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [handleFiles, disabled]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onFileSelect(updatedFiles);
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setErrors([]);
    onFileSelect([]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress({});

    try {
      // Simulate progress for each file
      selectedFiles.forEach(file => {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      });

      await onUpload(selectedFiles);

      // Clear files after successful upload
      setSelectedFiles([]);
      setErrors([]);
      onFileSelect([]);

    } catch (error: any) {
      setErrors([error.message || 'Upload failed']);
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive 
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900' 
            : 'border-secondary-300 dark:border-secondary-600 hover:border-primary-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        <div className="space-y-2">
          <SafeIcon 
            icon={FiUpload} 
            className={`w-12 h-12 mx-auto ${
              dragActive ? 'text-primary-500' : 'text-secondary-400'
            }`} 
          />
          <div>
            <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
              {dragActive ? 'Drop files here' : 'Drop files here or click to browse'}
            </p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400">
              {multiple ? `Up to ${maxFiles} files` : 'Single file'}, max {maxSize}MB each
            </p>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-danger-50 dark:bg-danger-900 border border-danger-200 dark:border-danger-800 rounded-md p-3"
          >
            {errors.map((error, index) => (
              <div key={index} className="flex items-center text-sm text-danger-700 dark:text-danger-300">
                <SafeIcon icon={FiAlertCircle} className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Files */}
      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                Selected Files ({selectedFiles.length})
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFiles}
                disabled={uploading}
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-2 bg-secondary-50 dark:bg-secondary-800 rounded-md"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <SafeIcon icon={FiFile} className="w-4 h-4 text-secondary-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {uploading && uploadProgress[file.name] !== undefined && (
                    <div className="w-20 mx-3">
                      <div className="bg-secondary-200 dark:bg-secondary-700 rounded-full h-1">
                        <div
                          className="bg-primary-500 h-1 rounded-full transition-all"
                          style={{ width: `${uploadProgress[file.name]}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    className="p-1 text-secondary-400 hover:text-danger-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <SafeIcon icon={FiX} className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Upload Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading}
                className="min-w-[120px]"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiUpload} className="w-4 h-4 mr-2" />
                    Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;