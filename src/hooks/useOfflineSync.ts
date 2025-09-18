import { useEffect } from 'react';
import { useStore } from '../store';
import { clientService } from '../services/clientService';
import { dailyLogService } from '../services/dailyLogService';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { timeTrackingService } from '../services/timeTrackingService';
import { PendingChange } from '../store/offlineSlice';

const MAX_RETRIES = 3;

const serviceMap = {
  project: projectService,
  task: taskService,
  client: clientService,
  daily_log: dailyLogService,
  time_entry: timeTrackingService,
};

export const useOfflineSync = () => {
  const {
    isOnline,
    pendingChanges,
    syncInProgress,
    setSyncInProgress,
    removePendingChange,
    moveToFailed,
    incrementRetryCount,
  } = useStore(state => state.offline);

  const processQueue = async () => {
    if (syncInProgress || !pendingChanges.length) {
      return;
    }

    setSyncInProgress(true);

    for (const change of pendingChanges) {
      try {
        await processChange(change);
        removePendingChange(change.id);
      } catch (error) {
        console.error(`Failed to sync change ${change.id}, retry #${change.retryCount + 1}:`, error);

        incrementRetryCount(change.id);

        const updatedChange = useStore.getState().offline.pendingChanges.find(c => c.id === change.id);

        if (updatedChange && updatedChange.retryCount >= MAX_RETRIES) {
          console.error(`Change ${change.id} has reached max retries. Moving to failed queue.`);
          moveToFailed(change.id);
        }
      }
    }

    setSyncInProgress(false);
  };

  const processChange = async (change: PendingChange) => {
    const service = serviceMap[change.entity];
    if (!service) {
      throw new Error(`No service found for entity: ${change.entity}`);
    }

    switch (change.type) {
      case 'CREATE':
        if ('create' in service) {
          // The 'create' methods might have different signatures.
          // This is a simplification and would need to be made more robust.
          // @ts-ignore
          return await service.create(change.payload);
        }
        break;
      case 'UPDATE':
        if ('update' in service) {
          // @ts-ignore
          return await service.update(change.payload.id, change.payload);
        }
        break;
      case 'DELETE':
        if ('delete' in service) {
          // @ts-ignore
          return await service.delete(change.payload.id);
        }
        break;
      default:
        throw new Error(`Unsupported change type: ${change.type}`);
    }
  };

  useEffect(() => {
    if (isOnline && pendingChanges.length > 0) {
      processQueue();
    }
  }, [isOnline, pendingChanges.length]);
};
