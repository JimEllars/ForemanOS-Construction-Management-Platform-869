import { supabase } from '../lib/supabaseClient';
import { Task } from '../types';

const TABLE_NAME = 'tasks_fos2025';

export const taskService = {
  async getTasksByProject(projectId: string): Promise<Task[]> {
    console.log('🔍 Fetching tasks for specific project:', projectId);
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching tasks for project:', error);
      throw error;
    }

    console.log('✅ Tasks fetched for project:', (data || []).length);
    return data || [];
  },

  async getTasksByCompany(companyId: string): Promise<Task[]> {
    try {
      console.log('🔍 Fetching tasks for company:', companyId);

      // ✅ BULLETPROOF: Get project IDs first with enhanced error handling
      console.log('📋 Step 1: Getting project IDs for company...');
      const { data: projects, error: projectsError } = await supabase
        .from('projects_fos2025')
        .select('id')
        .eq('company_id', companyId);

      if (projectsError) {
        console.error('❌ Error fetching projects for tasks:', projectsError);
        console.error('❌ Project fetch error details:', {
          message: projectsError.message,
          code: projectsError.code,
          details: projectsError.details
        });
        
        // ✅ GRACEFUL DEGRADATION: Return empty array instead of throwing
        console.log('🔄 Returning empty tasks array due to projects error (preventing crash)');
        return [];
      }

      if (!projects || projects.length === 0) {
        console.log('ℹ️ No projects found for company, returning empty tasks array');
        console.log('ℹ️ This is normal for new companies or companies without projects yet');
        return [];
      }

      const projectIds = projects.map(p => p.id);
      console.log('📋 Step 2: Found project IDs:', projectIds.length, 'projects');

      // ✅ IMPROVED: Batch fetch tasks with better error handling
      console.log('📋 Step 3: Fetching tasks for all company projects...');
      const { data: tasks, error: tasksError } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false });

      if (tasksError) {
        console.error('❌ Error fetching company tasks:', tasksError);
        console.error('❌ Tasks fetch error details:', {
          message: tasksError.message,
          code: tasksError.code,
          details: tasksError.details
        });
        
        // ✅ GRACEFUL DEGRADATION: Return empty array instead of throwing
        console.log('🔄 Returning empty tasks array due to tasks error (preventing crash)');
        return [];
      }

      const taskCount = (tasks || []).length;
      console.log('✅ Successfully fetched tasks:', taskCount);
      
      if (taskCount > 0) {
        console.log('📊 Task distribution by project:', 
          projectIds.map(pid => ({
            projectId: pid,
            taskCount: (tasks || []).filter(t => t.project_id === pid).length
          }))
        );
      }

      return tasks || [];

    } catch (error) {
      console.error('❌ Critical error in getTasksByCompany:', error);
      
      // Enhanced error logging
      if (error instanceof Error) {
        console.error('❌ Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }

      // ✅ BULLETPROOF: Always return empty array on any failure to prevent app crashes
      console.log('🔄 Returning empty array due to error (preventing crash)');
      return [];
    }
  },

  async createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    console.log('📝 Creating new task:', taskData.title);
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(taskData)
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating task:', error);
      throw error;
    }

    console.log('✅ Task created successfully:', data.title);
    return data;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    console.log('📝 Updating task:', id);
    
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
      console.error('❌ Error updating task:', error);
      throw error;
    }

    console.log('✅ Task updated successfully:', data.title);
    return data;
  },

  async deleteTask(id: string): Promise<void> {
    console.log('🗑️ Deleting task:', id);
    
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting task:', error);
      throw error;
    }

    console.log('✅ Task deleted successfully');
  }
};