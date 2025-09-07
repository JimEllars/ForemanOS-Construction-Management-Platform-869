import { create } from 'zustand';
import { AuthSlice, createAuthSlice } from './authSlice';
import { DataSlice, createDataSlice } from './dataSlice';
import { OfflineSlice, createOfflineSlice } from './offlineSlice';

type StoreState = AuthSlice & DataSlice & OfflineSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createDataSlice(...a),
  ...createOfflineSlice(...a),
}));