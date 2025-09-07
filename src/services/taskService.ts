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
    try {
      console.log('🔍 Fetching tasks for company:', companyId);

      // First, get all project IDs for the company
      // This makes the task service independent of UI loading order
      console.log('📋 Getting project IDs for company...');
      const { data: projects, error: projectsError } = await supabase
        .from('projects_fos2025')
        .select('id')
        .eq('company_id', companyId);

      if (projectsError) {
        console.error('❌ Error fetching projects for tasks:', projectsError);
        throw projectsError;
      }

      if (!projects || projects.length === 0) {
        console.log('ℹ️ No projects found for company, returning empty tasks array');
        return []; // No projects means no tasks
      }

      const projectIds = projects.map(p => p.id);
      console.log('📋 Found project IDs:', projectIds);

      // Then, fetch all tasks that belong to those projects
      console.log('📋 Fetching tasks for projects...');
      const { data: tasks, error: tasksError } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false });

      if (tasksError) {
        console.error('❌ Error fetching company tasks:', tasksError);
        throw tasksError;
      }

      console.log('✅ Successfully fetched tasks:', (tasks || []).length);
      return tasks || [];

    } catch (error) {
      console.error('❌ Critical error in getTasksByCompany:', error);
      // Always return an array to prevent crashes
      return [];
    }
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
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
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