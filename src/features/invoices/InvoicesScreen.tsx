import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import { Button } from '../../components/ui/Button';

const { FiCreditCard, FiPlus } = FiIcons;

const InvoicesScreen: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">Invoices</h1>
          <p className="text-secondary-600 dark:text-secondary-400">Create, send, and track your invoices.</p>
        </div>
        <Button>
          <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </div>

      <div className="bg-white dark:bg-secondary-800 p-8 rounded-lg text-center border-2 border-dashed border-secondary-300 dark:border-secondary-700">
        <SafeIcon icon={FiCreditCard} className="w-16 h-16 mx-auto text-secondary-400 mb-4" />
        <h3 className="text-lg font-medium text-secondary-900 dark:text-secondary-100 mb-2">
          Invoice Management Coming Soon
        </h3>
        <p className="text-secondary-600 dark:text-secondary-400">
          This is where you will be able to create, view, send, and manage all your invoices.
        </p>
      </div>
    </div>
  );
};

export default InvoicesScreen;
