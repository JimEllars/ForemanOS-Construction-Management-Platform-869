import React from 'react';
import { useStore } from '../../store';
import { FiWifi, FiWifiOff, FiLoader, FiAlertTriangle, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { Button } from './Button';

const OfflineSyncIndicator: React.FC = () => {
  const {
    isOnline,
    syncInProgress,
    pendingChanges,
    failedChanges,
    retryFailedChange,
    clearFailedChanges
  } = useStore(state => state.offline);

  const StatusIcon = () => {
    if (syncInProgress) return <FiLoader className="animate-spin h-5 w-5 text-blue-500" />;
    if (isOnline) return <FiWifi className="h-5 w-5 text-green-500" />;
    return <FiWifiOff className="h-5 w-5 text-gray-500" />;
  };

  const getStatusText = () => {
    if (syncInProgress) return `Syncing ${pendingChanges.length} item(s)...`;
    if (!isOnline) return "You are offline. Changes will be synced when you're back online.";
    if (failedChanges.length > 0) return `${failedChanges.length} failed changes.`;
    if (pendingChanges.length > 0) return `${pendingChanges.length} pending changes.`;
    return "All changes synced.";
  };

  if (pendingChanges.length === 0 && failedChanges.length === 0) {
    return null; // Don't show anything if there's nothing to sync or fix
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 w-80 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-2">
        <StatusIcon />
        <p className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">{getStatusText()}</p>
      </div>

      {failedChanges.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center">
            <FiAlertTriangle className="mr-2" />
            Failed Changes
          </h4>
          <ul className="mt-2 space-y-2 text-xs max-h-32 overflow-y-auto">
            {failedChanges.map(change => (
              <li key={change.id} className="flex justify-between items-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                <span className="truncate pr-2">{change.type} {change.entity}</span>
                <Button size="sm" variant="ghost" onClick={() => retryFailedChange(change.id)}>
                  <FiRefreshCw />
                </Button>
              </li>
            ))}
          </ul>
          <Button size="sm" variant="outline" className="mt-2 w-full" onClick={clearFailedChanges}>
            <FiTrash2 className="mr-2" />
            Clear Failed
          </Button>
        </div>
      )}
    </div>
  );
};

export default OfflineSyncIndicator;
