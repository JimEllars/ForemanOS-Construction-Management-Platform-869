import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from './Button';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSun, FiMoon } = FiIcons;

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 'md', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <Button
      variant="ghost"
      size={size === 'lg' ? 'default' : 'sm'}
      onClick={toggleTheme}
      className="transition-colors"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <SafeIcon 
        icon={theme === 'light' ? FiMoon : FiSun} 
        className={iconSizes[size]} 
      />
      {showLabel && (
        <span className="ml-2">
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </Button>
  );
};

export default ThemeToggle;