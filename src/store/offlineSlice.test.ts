import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { createOfflineSlice, OfflineSlice, PendingChange } from './offlineSlice';

const getInitialState = () => ({
  isOnline: true,
  syncInProgress: false,
  pendingChanges: [],
  failedChanges: [],
});

const store = createStore<OfflineSlice>((set, get, api) => createOfflineSlice(set, get, api));
const { getState, setState } = store;

describe('offlineSlice', () => {
  beforeEach(() => {
    setState(getInitialState());
  });

  it('should add a pending change', () => {
    const change: Omit<PendingChange, 'id' | 'timestamp' | 'retryCount'> = {
      type: 'CREATE',
      entity: 'project',
      payload: { name: 'New Project' },
    };
    getState().addPendingChange(change);

    const { pendingChanges } = getState();
    expect(pendingChanges).toHaveLength(1);
    expect(pendingChanges[0].type).toBe('CREATE');
    expect(pendingChanges[0].retryCount).toBe(0);
  });

  it('should remove a pending change', () => {
    getState().addPendingChange({ type: 'CREATE', entity: 'project', payload: {} });
    const changeId = getState().pendingChanges[0].id;

    getState().removePendingChange(changeId);
    expect(getState().pendingChanges).toHaveLength(0);
  });

  it('should increment retry count for a pending change', () => {
    getState().addPendingChange({ type: 'CREATE', entity: 'project', payload: {} });
    const changeId = getState().pendingChanges[0].id;

    getState().incrementRetryCount(changeId);
    expect(getState().pendingChanges[0].retryCount).toBe(1);
  });

  it('should move a pending change to the failed queue', () => {
    getState().addPendingChange({ type: 'CREATE', entity: 'project', payload: {} });
    const changeId = getState().pendingChanges[0].id;

    getState().moveToFailed(changeId);

    expect(getState().pendingChanges).toHaveLength(0);
    expect(getState().failedChanges).toHaveLength(1);
    expect(getState().failedChanges[0].id).toBe(changeId);
    expect(getState().failedChanges[0].retryCount).toBe(1); // retryCount is incremented on move
  });

  it('should retry a failed change', () => {
    // First, move a change to failed
    getState().addPendingChange({ type: 'CREATE', entity: 'project', payload: {} });
    const changeId = getState().pendingChanges[0].id;
    getState().moveToFailed(changeId);

    // Now, retry it
    getState().retryFailedChange(changeId);

    expect(getState().failedChanges).toHaveLength(0);
    expect(getState().pendingChanges).toHaveLength(1);
    expect(getState().pendingChanges[0].id).toBe(changeId);
    expect(getState().pendingChanges[0].retryCount).toBe(1); // retryCount is preserved
  });

  it('should clear all failed changes', () => {
    // Move two changes to failed
    getState().addPendingChange({ type: 'CREATE', entity: 'project', payload: {} });
    getState().addPendingChange({ type: 'UPDATE', entity: 'task', payload: {} });
    getState().moveToFailed(getState().pendingChanges[0].id);
    getState().moveToFailed(getState().pendingChanges[0].id); // Note: index 0 because the array shrinks

    expect(getState().failedChanges).toHaveLength(2);

    getState().clearFailedChanges();
    expect(getState().failedChanges).toHaveLength(0);
  });
});
