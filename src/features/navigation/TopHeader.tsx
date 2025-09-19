import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { useStore } from '../../store';
import { Button } from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const { FiMenu, FiBell, FiUser, FiLogOut, FiSettings, FiWifi, FiWifiOff, FiRefreshCw } = FiIcons;

interface TopHeaderProps {
  onMenuClick: () => void;
}

const StatusIndicator: React.FC = () => {
  const { isOnline, syncInProgress } = useStore(state => state.offline);

  if (syncInProgress) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-medium">
        <FiRefreshCw className="w-3 h-3 animate-spin" />
        <span>Syncing...</span>
      </div>
    );
  }

  if (isOnline) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 text-xs font-medium">
        <FiWifi className="w-3 h-3" />
        <span>Online</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-xs font-medium">
      <FiWifiOff className="w-3 h-3" />
      <span>Offline</span>
    </div>
  );
};


const TopHeader: React.FC<TopHeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useStore();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-md text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-secondary-800"
          >
            <SafeIcon icon={FiMenu} className="w-5 h-5" />
          </button>
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-secondary-900 dark:text-secondary-100">ForemanOS</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <StatusIndicator />
          <ThemeToggle />
          
          <button className="p-2 rounded-md text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-secondary-800">
            <SafeIcon icon={FiBell} className="w-5 h-5" />
          </button>

          <button className="p-2 rounded-md text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-secondary-800">
            <SafeIcon icon={FiSettings} className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 pl-2 border-l border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiUser} className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
              <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                {user?.name || 'User'}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="p-2">
              <SafeIcon icon={FiLogOut} className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;