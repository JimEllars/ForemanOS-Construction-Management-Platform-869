import React from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const {FiLoader} = FiIcons;

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  showIcon?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  showIcon = true
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      {showIcon && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className={`text-primary-600 ${sizeClasses[size]}`}
        >
          <SafeIcon icon={FiLoader} className={sizeClasses[size]} />
        </motion.div>
      )}
      
      {message && (
        <p className={`text-secondary-600 font-medium ${textSizeClasses[size]}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;