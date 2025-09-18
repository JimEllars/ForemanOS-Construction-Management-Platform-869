import { StateCreator } from 'zustand';

export interface PendingChange {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'project' | 'task' | 'client' | 'daily_log';
  payload: any;
  tempId?: string;
  timestamp: number;
  retryCount: number;
}

export interface OfflineSlice {
  isOnline: boolean;
  syncInProgress: boolean;
  pendingChanges: PendingChange[];
  failedChanges: PendingChange[];
  
  setOnlineStatus: (isOnline: boolean) => void;
  setSyncInProgress: (inProgress: boolean) => void;
  addPendingChange: (change: Omit<PendingChange, 'id' | 'timestamp' | 'retryCount'>) => void;
  removePendingChange: (id: string) => void;
  incrementRetryCount: (id: string) => void;
  moveToFailed: (id: string) => void;
  retryFailedChange: (id: string) => void;
  clearFailedChanges: () => void;
}

export const createOfflineSlice: StateCreator<OfflineSlice> = (set, get) => ({
  isOnline: navigator.onLine,
  syncInProgress: false,
  pendingChanges: [],
  failedChanges: [],

  setOnlineStatus: (isOnline) => set({ isOnline }),
  setSyncInProgress: (syncInProgress) => set({ syncInProgress }),
  
  addPendingChange: (change) => {
    const pendingChange: PendingChange = {
      ...change,
      id: `pending_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      retryCount: 0,
    };
    
    set((state) => ({
      pendingChanges: [...state.pendingChanges, pendingChange]
    }));
  },
  
  removePendingChange: (id) => set((state) => ({
    pendingChanges: state.pendingChanges.filter(change => change.id !== id)
  })),

  incrementRetryCount: (id) => set((state) => ({
    pendingChanges: state.pendingChanges.map(c =>
      c.id === id ? { ...c, retryCount: c.retryCount + 1 } : c
    )
  })),
  
  moveToFailed: (id) => {
    const state = get();
    const change = state.pendingChanges.find(c => c.id === id);
    if (change) {
      set({
        pendingChanges: state.pendingChanges.filter(c => c.id !== id),
        failedChanges: [...state.failedChanges, { ...change, retryCount: change.retryCount + 1 }]
      });
    }
  },
  
  retryFailedChange: (id) => {
    const state = get();
    const change = state.failedChanges.find(c => c.id === id);
    if (change) {
      set({
        failedChanges: state.failedChanges.filter(c => c.id !== id),
        pendingChanges: [...state.pendingChanges, change]
      });
    }
  },
  
  clearFailedChanges: () => set({ failedChanges: [] }),
});