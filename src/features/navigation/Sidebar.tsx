import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { clsx } from 'clsx';
import { useStore } from '../../store';

const { FiHome, FiFolderPlus, FiCheckSquare, FiUsers, FiFileText, FiClock, FiUpload, FiX, FiSettings } = FiIcons;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const baseNavigationItems = [
  { name: 'Dashboard', href: '/app', icon: FiHome, roles: ['admin', 'manager', 'worker'] },
  { name: 'Projects', href: '/app/projects', icon: FiFolderPlus, roles: ['admin', 'manager', 'worker'] },
  { name: 'Tasks', href: '/app/tasks', icon: FiCheckSquare, roles: ['admin', 'manager', 'worker'] },
  { name: 'Clients', href: '/app/clients', icon: FiUsers, roles: ['admin', 'manager'] },
  { name: 'Daily Logs', href: '/app/daily-logs', icon: FiFileText, roles: ['admin', 'manager', 'worker'] },
  { name: 'Time Tracking', href: '/app/time-tracking', icon: FiClock, roles: ['admin', 'manager', 'worker'] },
  { name: 'Documents', href: '/app/documents', icon: FiUpload, roles: ['admin', 'manager', 'worker'] },
  { name: 'Team', href: '/app/team', icon: FiUsers, roles: ['admin', 'manager'] },
  { name: 'Settings', href: '/app/settings', icon: FiSettings, roles: ['admin'] },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const user = useStore(state => state.auth.user);
  const userRole = user?.role || 'worker';

  const navigationItems = baseNavigationItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-secondary-900 border-r border-secondary-200 dark:border-secondary-700 transform md:relative md:translate-x-0 md:block transition-colors',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-secondary-200 dark:border-secondary-700">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">ForemanOS</h2>
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-md text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-secondary-100 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                  )
                }
              >
                <SafeIcon icon={item.icon} className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
            <div className="text-xs text-secondary-500 dark:text-secondary-400 text-center">
              <p>ForemanOS v1.0</p>
              <p>Field Operations Management</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;