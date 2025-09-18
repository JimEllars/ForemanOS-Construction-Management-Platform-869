import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { Button } from '../../components/ui/Button';

const { FiUsers, FiPlus } = FiIcons;

const TeamScreen: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Team Management</h1>
          <p className="text-secondary-600">Invite and manage your team members.</p>
        </div>
        <Button>
          <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <div className="bg-white dark:bg-secondary-800 p-8 rounded-lg text-center border-2 border-dashed border-secondary-300 dark:border-secondary-700">
        <SafeIcon icon={FiUsers} className="w-16 h-16 mx-auto text-secondary-400 mb-4" />
        <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
          Team Management Feature Coming Soon
        </h3>
        <p className="text-secondary-600 dark:text-secondary-400">
          This is where you will be able to invite new users, assign roles, and manage your team.
        </p>
      </div>
    </div>
  );
};

export default TeamScreen;
