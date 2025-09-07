import { supabase } from '../lib/supabaseClient';
import { Task } from '../types';

const TABLE_NAME = 'tasks_fos2025';

export const taskService = {
  async getTasksByProject(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }

    return data || [];
  },

  async getTasksByCompany(companyId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select(`
        *,
        projects_fos2025!inner(company_id)
      `)
      .eq('projects_fos2025.company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching company tasks:', error);
      throw error;
    }

    return data || [];
  },

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(taskData)
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      throw error;
    }

    return data;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    }

    return data;
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
};