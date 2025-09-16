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
  project_name?: string;
  date: string;
  weather?: string;
  work_completed: string;
  materials_used?: string;
  crew_present?: string;
  notes?: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  project_id: string;
  project_name?: string;
  name: string;
  storage_path: string;
  file_type: string;
  file_extension?: string;
  category: string;
  size_bytes: number;
  size_display?: string;
  uploaded_by: string;
  uploaded_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  project_id: string;
  project_name?: string;
  task_id?: string;
  task_name?: string;
  user_id: string;
  user_name?: string;
  start_time: string;
  end_time?: string;
  duration_hours?: number;
  description?: string;
  is_running: boolean;
  created_at: string;
  updated_at: string;
}