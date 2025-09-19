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
    console.log(`[OfflineSync] Starting queue processing. ${pendingChanges.length} items to sync.`);

    for (const change of [...pendingChanges]) { // Create a copy to iterate over
      try {
        console.log(`[OfflineSync] Processing change: ${change.id} (${change.type} ${change.entity})`);
        await processChange(change);
        removePendingChange(change.id);
        console.log(`[OfflineSync] Successfully synced change: ${change.id}`);
      } catch (error) {
        console.error(`[OfflineSync] Failed to sync change ${change.id}, retry #${change.retryCount + 1}:`, error);

        incrementRetryCount(change.id);

        const updatedChange = useStore.getState().offline.pendingChanges.find(c => c.id === change.id);

        if (updatedChange && updatedChange.retryCount >= MAX_RETRIES) {
          console.error(`[OfflineSync] Change ${change.id} has reached max retries. Moving to failed queue.`);
          moveToFailed(change.id);
        }
      }
    }

    setSyncInProgress(false);
    console.log('[OfflineSync] Queue processing finished.');
  };

  const processChange = async (change: PendingChange) => {
    const service = serviceMap[change.entity];
    if (!service) {
      throw new Error(`[OfflineSync] No service found for entity: ${change.entity}`);
    }

    switch (change.type) {
      case 'CREATE':
        if ('create' in service && typeof service.create === 'function') {
          // Example: projectService.create(projectData)
          return await service.create(change.payload);
        }
        throw new Error(`[OfflineSync] 'create' method not implemented for ${change.entity} service.`);

      case 'UPDATE':
        if ('update' in service && typeof service.update === 'function') {
          const { id, ...updateData } = change.payload;
          if (!id) throw new Error(`[OfflineSync] Missing ID for UPDATE operation on ${change.entity}`);
          // Example: projectService.update(id, projectData)
          return await service.update(id, updateData);
        }
        throw new Error(`[OfflineSync] 'update' method not implemented for ${change.entity} service.`);

      case 'DELETE':
        if ('delete' in service && typeof service.delete === 'function') {
          const { id } = change.payload;
          if (!id) throw new Error(`[OfflineSync] Missing ID for DELETE operation on ${change.entity}`);
          // Example: projectService.delete(id)
          return await service.delete(id);
        }
        throw new Error(`[OfflineSync] 'delete' method not implemented for ${change.entity} service.`);

      default:
        // This should not be reached if types are correct
        const exhaustiveCheck: never = change.type;
        throw new Error(`[OfflineSync] Unsupported change type: ${exhaustiveCheck}`);
    }
  };

  useEffect(() => {
    if (isOnline && pendingChanges.length > 0) {
      console.log('[OfflineSync] Online status detected with pending changes. Triggering queue processing.');
      processQueue();
    }
  }, [isOnline, pendingChanges.length]);
};
