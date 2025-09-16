import { create } from 'zustand';
import { AuthSlice, createAuthSlice } from './authSlice';
import { DataSlice, createDataSlice } from './dataSlice';
import { OfflineSlice, createOfflineSlice } from './offlineSlice';
import { DocumentSlice, createDocumentSlice } from './documentSlice';
import { TimeTrackingSlice, createTimeTrackingSlice } from './timeTrackingSlice';

type StoreState = AuthSlice & DataSlice & OfflineSlice & DocumentSlice & TimeTrackingSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createDataSlice(...a),
  ...createOfflineSlice(...a),
  ...createDocumentSlice(...a),
  ...createTimeTrackingSlice(...a),
}));