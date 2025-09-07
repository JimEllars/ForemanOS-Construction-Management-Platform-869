export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member';
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  client_id?: string;
  company_id: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  created_at: string;
  updated_at: string;
  syncStatus?: 'pending' | 'synced' | 'error';
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  project_id: string;
  assigned_to?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  syncStatus?: 'pending' | 'synced' | 'error';
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface DailyLog {
  id: string;
  project_id: string;
  date: string;
  weather?: string;
  work_completed: string;
  materials_used?: string;
  crew_present?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}