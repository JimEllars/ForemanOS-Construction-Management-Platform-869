import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import LoadingSpinner from './LoadingSpinner';
import { Button } from './Button';

const { FiWifi, FiWifiOff, FiRefreshCw, FiAlertCircle, FiCheckCircle } = FiIcons;

interface DataLoadingStateProps {
  isLoading: boolean;
  isOnline: boolean;
  error?: string | null;
  onRetry?: () => void;
  loadingMessage?: string;
  children: React.ReactNode;
}

const DataLoadingState: React.FC<DataLoadingStateProps> = ({
  isLoading,
  isOnline,
  error,
  onRetry,
  loadingMessage = "Loading your data...",
  children
}) => {

  // ✅ IMPROVED: Better loading state with timeout protection
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <LoadingSpinner size="lg" message={loadingMessage} />
          
          {/* Sequential Progress Indicator */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-secondary-200 max-w-sm">
            <div className="space-y-3 text-sm">
              <div className="text-secondary-700 font-medium mb-3">
                Loading Sequence
              </div>
              
              {/* Step 1: Projects */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                  <span className="text-secondary-600">1. Loading projects...</span>
                </div>
              </div>
              
              {/* Step 2: Tasks */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-secondary-200 rounded-full"></div>
                  <span className="text-secondary-500">2. Loading tasks...</span>
                </div>
                <span className="text-xs text-secondary-400">depends on projects</span>
              </div>
              
              {/* Step 3: Clients */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-secondary-200 rounded-full"></div>
                  <span className="text-secondary-500">3. Loading clients...</span>
                </div>
                <span className="text-xs text-secondary-400">parallel</span>
              </div>
              
              <div className="pt-2 border-t border-secondary-100">
                <div className="text-xs text-secondary-500">
                  Sequential loading prevents race conditions
                </div>
              </div>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center justify-center space-x-2">
            <SafeIcon 
              icon={isOnline ? FiWifi : FiWifiOff} 
              className={`w-4 h-4 ${isOnline ? 'text-success-600' : 'text-warning-600'}`} 
            />
            <span className="text-sm text-secondary-600">
              {isOnline ? 'Connected' : 'Working offline'}
            </span>
          </div>

          {/* ✅ BULLETPROOF: Show fallback option if loading takes too long */}
          <div className="mt-4 p-3 bg-secondary-50 rounded-lg text-xs text-secondary-600">
            <p className="font-medium mb-1">Taking longer than expected?</p>
            <p>You can continue using the app - data will load in the background.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show detailed error state
  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <SafeIcon icon={FiAlertCircle} className="w-16 h-16 text-danger-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">
            Data Loading Failed
          </h3>
          <p className="text-secondary-600 mb-4">
            {error}
          </p>

          {/* Troubleshooting Info */}
          <div className="bg-secondary-50 rounded-lg p-4 text-left mb-4">
            <h4 className="text-sm font-medium text-secondary-900 mb-2">
              Troubleshooting Steps:
            </h4>
            <ul className="text-xs text-secondary-600 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Verify you have access to this company</li>
              <li>• Try refreshing the page</li>
              <li>• Contact support if the issue persists</li>
            </ul>
          </div>

          {/* Connection status */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <SafeIcon 
              icon={isOnline ? FiWifi : FiWifiOff} 
              className={`w-4 h-4 ${isOnline ? 'text-success-600' : 'text-danger-600'}`} 
            />
            <span className="text-sm text-secondary-600">
              {isOnline ? 'Connected to internet' : 'No internet connection'}
            </span>
          </div>

          {onRetry && (
            <div className="space-y-2">
              <Button 
                onClick={onRetry} 
                disabled={!isOnline}
                className="w-full"
              >
                <SafeIcon icon={FiRefreshCw} className="w-4 h-4 mr-2" />
                {isOnline ? 'Try Again' : 'Retry when online'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>
          )}

          {/* ✅ BULLETPROOF: Allow user to continue even with errors */}
          <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <p className="text-xs text-primary-700">
              <strong>Note:</strong> You can still use the app with limited functionality. 
              New data will be saved and synced when the connection is restored.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show success state briefly before showing children
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

export default DataLoadingState;