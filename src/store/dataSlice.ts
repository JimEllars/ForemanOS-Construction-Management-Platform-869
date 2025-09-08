import {StateCreator} from 'zustand';
import {Project,Task,Client,DailyLog} from '../types';

export interface DataSlice {
  projects: Project[];
  tasks: Task[];
  clients: Client[];
  dailyLogs: DailyLog[];
  isLoading: boolean;

  // Projects
  setProjects: (projects: Project[])=> void;
  addProject: (project: Project)=> void;
  updateProject: (id: string,updates: Partial<Project>)=> void;
  removeProject: (id: string)=> void;

  // Tasks
  setTasks: (tasks: Task[])=> void;
  addTask: (task: Task)=> void;
  updateTask: (id: string,updates: Partial<Task>)=> void;
  removeTask: (id: string)=> void;

  // Clients
  setClients: (clients: Client[])=> void;
  addClient: (client: Client)=> void;
  updateClient: (id: string,updates: Partial<Client>)=> void;
  removeClient: (id: string)=> void;

  // Daily Logs
  setDailyLogs: (logs: DailyLog[])=> void;
  addDailyLog: (log: DailyLog)=> void;

  setLoading: (loading: boolean)=> void;
}

// ✅ MOCK DATA: Sample data for testing without authentication
const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Downtown Office Building',
    description: 'Commercial office building construction project',
    status: 'in_progress',
    company_id: 'mock-company-id',
    start_date: '2024-01-15',
    budget: 250000,
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: 'proj-2',
    name: 'Residential Complex Phase 1',
    description: 'First phase of luxury residential development',
    status: 'planning',
    company_id: 'mock-company-id',
    start_date: '2024-02-01',
    budget: 450000,
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-18T16:45:00Z'
  },
  {
    id: 'proj-3',
    name: 'Highway Bridge Repair',
    description: 'Infrastructure repair and maintenance project',
    status: 'completed',
    company_id: 'mock-company-id',
    start_date: '2023-11-01',
    end_date: '2024-01-10',
    budget: 180000,
    created_at: '2023-10-25T08:00:00Z',
    updated_at: '2024-01-10T17:00:00Z'
  }
];

const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Foundation Excavation',
    description: 'Excavate foundation area according to blueprints',
    status: 'in_progress',
    priority: 'high',
    project_id: 'proj-1',
    due_date: '2024-02-05',
    created_at: '2024-01-15T09:30:00Z',
    updated_at: '2024-01-20T11:15:00Z'
  },
  {
    id: 'task-2',
    title: 'Electrical Rough-in',
    description: 'Install electrical wiring and outlets',
    status: 'todo',
    priority: 'medium',
    project_id: 'proj-1',
    due_date: '2024-02-15',
    created_at: '2024-01-16T14:00:00Z',
    updated_at: '2024-01-16T14:00:00Z'
  },
  {
    id: 'task-3',
    title: 'Site Survey',
    description: 'Complete topographical survey of construction site',
    status: 'completed',
    priority: 'high',
    project_id: 'proj-2',
    due_date: '2024-01-25',
    created_at: '2024-01-10T10:30:00Z',
    updated_at: '2024-01-25T16:00:00Z'
  },
  {
    id: 'task-4',
    title: 'Permit Applications',
    description: 'Submit all required building permits',
    status: 'in_progress',
    priority: 'high',
    project_id: 'proj-2',
    due_date: '2024-02-10',
    created_at: '2024-01-12T09:00:00Z',
    updated_at: '2024-01-22T13:30:00Z'
  }
];

const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'Metro Development Corp',
    email: 'contact@metrodev.com',
    phone: '(555) 123-4567',
    address: '123 Business District, Downtown City, ST 12345',
    company_id: 'mock-company-id',
    created_at: '2024-01-05T08:00:00Z',
    updated_at: '2024-01-15T12:00:00Z'
  },
  {
    id: 'client-2',
    name: 'Sunrise Residential',
    email: 'info@sunriseresidential.com',
    phone: '(555) 987-6543',
    address: '456 Suburban Lane, Residential Area, ST 54321',
    company_id: 'mock-company-id',
    created_at: '2024-01-08T10:30:00Z',
    updated_at: '2024-01-18T14:20:00Z'
  },
  {
    id: 'client-3',
    name: 'State Transportation Dept',
    email: 'projects@statetransport.gov',
    phone: '(555) 246-8135',
    address: '789 Government Plaza, Capital City, ST 98765',
    company_id: 'mock-company-id',
    created_at: '2023-10-20T09:00:00Z',
    updated_at: '2024-01-10T17:30:00Z'
  }
];

export const createDataSlice: StateCreator<DataSlice>=(set)=> ({
  // ✅ INITIALIZE: Start with mock data for testing
  projects: mockProjects,
  tasks: mockTasks,
  clients: mockClients,
  dailyLogs: [],
  isLoading: false,

  // Projects
  setProjects: (projects)=> set({projects}),
  addProject: (project)=> set((state)=> ({
    projects: [...state.projects,project]
  })),
  updateProject: (id,updates)=> set((state)=> ({
    projects: state.projects.map(p=> p.id===id ? {...p,...updates} : p)
  })),
  removeProject: (id)=> set((state)=> ({
    projects: state.projects.filter(p=> p.id !==id)
  })),

  // Tasks
  setTasks: (tasks)=> set({tasks}),
  addTask: (task)=> set((state)=> ({
    tasks: [...state.tasks,task]
  })),
  updateTask: (id,updates)=> set((state)=> ({
    tasks: state.tasks.map(t=> t.id===id ? {...t,...updates} : t)
  })),
  removeTask: (id)=> set((state)=> ({
    tasks: state.tasks.filter(t=> t.id !==id)
  })),

  // Clients
  setClients: (clients)=> set({clients}),
  addClient: (client)=> set((state)=> ({
    clients: [...state.clients,client]
  })),
  updateClient: (id,updates)=> set((state)=> ({
    clients: state.clients.map(c=> c.id===id ? {...c,...updates} : c)
  })),
  removeClient: (id)=> set((state)=> ({
    clients: state.clients.filter(c=> c.id !==id)
  })),

  // Daily Logs
  setDailyLogs: (dailyLogs)=> set({dailyLogs}),
  addDailyLog: (log)=> set((state)=> ({
    dailyLogs: [...state.dailyLogs,log]
  })),

  setLoading: (isLoading)=> set({isLoading}),
});