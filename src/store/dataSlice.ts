import { StateCreator } from 'zustand';
import { Project, Task, Client, DailyLog } from '../types';

export interface DataSlice {
  projects: Project[];
  tasks: Task[];
  clients: Client[];
  dailyLogs: DailyLog[];
  isLoading: boolean;
  
  // Projects
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  
  // Tasks
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  
  // Clients
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  removeClient: (id: string) => void;
  
  // Daily Logs
  setDailyLogs: (logs: DailyLog[]) => void;
  addDailyLog: (log: DailyLog) => void;
  
  setLoading: (loading: boolean) => void;
}

export const createDataSlice: StateCreator<DataSlice> = (set) => ({
  projects: [],
  tasks: [],
  clients: [],
  dailyLogs: [],
  isLoading: false,

  // Projects
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  removeProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id)
  })),

  // Tasks
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ 
    tasks: [...state.tasks, task] 
  })),
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),

  // Clients
  setClients: (clients) => set({ clients }),
  addClient: (client) => set((state) => ({ 
    clients: [...state.clients, client] 
  })),
  updateClient: (id, updates) => set((state) => ({
    clients: state.clients.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  removeClient: (id) => set((state) => ({
    clients: state.clients.filter(c => c.id !== id)
  })),

  // Daily Logs
  setDailyLogs: (dailyLogs) => set({ dailyLogs }),
  addDailyLog: (log) => set((state) => ({ 
    dailyLogs: [...state.dailyLogs, log] 
  })),

  setLoading: (isLoading) => set({ isLoading }),
});