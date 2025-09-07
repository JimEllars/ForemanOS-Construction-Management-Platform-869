import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { useStore } from '../../store';
import { Button } from '../../components/ui/Button';

const { FiMenu, FiBell, FiUser, FiLogOut } = FiIcons;

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
    <header className="bg-white border-b border-secondary-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
          >
            <SafeIcon icon={FiMenu} className="w-5 h-5" />
          </button>
          
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-secondary-900">ForemanOS</h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-md text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100">
            <SafeIcon icon={FiBell} className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiUser} className="w-5 h-5 text-secondary-600" />
              <span className="text-sm font-medium text-secondary-900">
                {user?.name || 'User'}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="p-2"
            >
              <SafeIcon icon={FiLogOut} className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;