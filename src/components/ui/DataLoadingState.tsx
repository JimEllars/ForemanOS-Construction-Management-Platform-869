import React from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import LoadingSpinner from './LoadingSpinner';
import {Button} from './Button';

const {FiWifi, FiWifiOff, FiRefreshCw, FiAlertCircle} = FiIcons;

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
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <LoadingSpinner size="lg" message={loadingMessage} />
          
          {/* Offline indicator */}
          {!isOnline && (
            <div className="flex items-center justify-center space-x-2 text-warning-600 bg-warning-50 px-4 py-2 rounded-lg">
              <SafeIcon icon={FiWifiOff} className="w-4 h-4" />
              <span className="text-sm">Working offline</span>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Show error state
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
            Unable to load data
          </h3>
          <p className="text-secondary-600 mb-4">
            {error}
          </p>
          
          {/* Connection status */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <SafeIcon 
              icon={isOnline ? FiWifi : FiWifiOff} 
              className={`w-4 h-4 ${isOnline ? 'text-success-600' : 'text-danger-600'}`} 
            />
            <span className="text-sm text-secondary-600">
              {isOnline ? 'Connected' : 'Offline'}
            </span>
          </div>

          {onRetry && (
            <Button onClick={onRetry} disabled={!isOnline}>
              <SafeIcon icon={FiRefreshCw} className="w-4 h-4 mr-2" />
              {isOnline ? 'Try Again' : 'Retry when online'}
            </Button>
          )}
        </motion.div>
      </div>
    );
  }

  // Show children when loaded successfully
  return <>{children}</>;
};

export default DataLoadingState;