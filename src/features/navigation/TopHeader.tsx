import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { useStore } from '../../store';
import { Button } from '../../components/ui/Button';

const { FiMenu, FiBell, FiUser, FiLogOut, FiSettings } = FiIcons;

interface TopHeaderProps {
  onMenuClick: () => void;
}

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