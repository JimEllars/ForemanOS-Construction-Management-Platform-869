import { StateCreator } from 'zustand';
import { TimeEntry } from '../types';

export interface TimeTrackingSlice {
  timeEntries: TimeEntry[];
  runningTimer: TimeEntry | null;

  // Time Entries
  setTimeEntries: (entries: TimeEntry[]) => void;
  addTimeEntry: (entry: TimeEntry) => void;
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void;
  removeTimeEntry: (id: string) => void;
  setRunningTimer: (timer: TimeEntry | null) => void;
}

// ✅ MOCK DATA: Sample time entries for testing
const mockTimeEntries: TimeEntry[] = [
  {
    id: 'time-1',
    project_id: 'proj-1',
    project_name: 'Downtown Office Building',
    task_id: 'task-1',
    task_name: 'Foundation Excavation',
    user_id: 'user-1',
    user_name: 'John Smith',
    start_time: '2024-01-22T08:00:00Z',
    end_time: '2024-01-22T12:00:00Z',
    duration_hours: 4.0,
    description: 'Excavated north foundation area, prepared for concrete pour',
    is_running: false,
    created_at: '2024-01-22T08:00:00Z',
    updated_at: '2024-01-22T12:00:00Z'
  },
  {
    id: 'time-2',
    project_id: 'proj-1',
    project_name: 'Downtown Office Building',
    task_id: 'task-2',
    task_name: 'Electrical Rough-in',
    user_id: 'user-3',
    user_name: 'Alex Chen',
    start_time: '2024-01-22T13:00:00Z',
    end_time: '2024-01-22T17:30:00Z',
    duration_hours: 4.5,
    description: 'Installed conduit runs for second floor lighting',
    is_running: false,
    created_at: '2024-01-22T13:00:00Z',
    updated_at: '2024-01-22T17:30:00Z'
  },
  {
    id: 'time-3',
    project_id: 'proj-2',
    project_name: 'Residential Complex Phase 1',
    task_id: 'task-3',
    task_name: 'Site Survey',
    user_id: 'user-2',
    user_name: 'Lisa Brown',
    start_time: '2024-01-23T09:00:00Z',
    end_time: null,
    duration_hours: null,
    description: 'Conducting topographical survey',
    is_running: true,
    created_at: '2024-01-23T09:00:00Z',
    updated_at: '2024-01-23T09:00:00Z'
  }
];

export const createTimeTrackingSlice: StateCreator<TimeTrackingSlice> = (set) => ({
  // ✅ INITIALIZE: Start with mock data for testing
  timeEntries: mockTimeEntries,
  runningTimer: mockTimeEntries.find(entry => entry.is_running) || null,

  // Time Entries
  setTimeEntries: (timeEntries) => set({ timeEntries }),
  addTimeEntry: (entry) => 
    set((state) => ({ 
      timeEntries: [entry, ...state.timeEntries] 
    })),
  updateTimeEntry: (id, updates) => 
    set((state) => ({
      timeEntries: state.timeEntries.map(entry => 
        entry.id === id ? { ...entry, ...updates } : entry
      ),
      // Update running timer if it's the same entry
      runningTimer: state.runningTimer?.id === id 
        ? { ...state.runningTimer, ...updates } 
        : state.runningTimer
    })),
  removeTimeEntry: (id) => 
    set((state) => ({
      timeEntries: state.timeEntries.filter(entry => entry.id !== id),
      // Clear running timer if it's the same entry
      runningTimer: state.runningTimer?.id === id ? null : state.runningTimer
    })),
  setRunningTimer: (runningTimer) => set({ runningTimer }),
});