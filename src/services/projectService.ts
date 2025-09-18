import { supabase } from '../lib/supabaseClient';
import { Project } from '../types';
import { useStore } from '../store';

const TABLE_NAME = 'projects_fos2025';

const { getState } = useStore;

export const projectService = {
  async getProjectsByCompany(companyId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    return data || [];
  },

  async createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { isOnline, addPendingChange } = getState().offline;

    if (!isOnline) {
      const tempId = `temp_${Date.now()}`;
      const optimisticProject: Project = {
        ...projectData,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        syncStatus: 'pending',
      };
      addPendingChange({ type: 'CREATE', entity: 'project', payload: projectData, tempId });
      // We need to update the store directly for optimistic UI
      getState().data.addProject(optimisticProject);
      return optimisticProject;
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }

    return data;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { isOnline, addPendingChange } = getState().offline;

    if (!isOnline) {
      addPendingChange({ type: 'UPDATE', entity: 'project', payload: { id, ...updates } });
      const updatedProject = { ...getState().data.projects.find(p => p.id === id), ...updates, syncStatus: 'pending' } as Project;
      getState().data.updateProject(id, updatedProject);
      return updatedProject;
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    return data;
  },

  async deleteProject(id: string): Promise<void> {
    const { isOnline, addPendingChange } = getState().offline;

    if (!isOnline) {
      addPendingChange({ type: 'DELETE', entity: 'project', payload: { id } });
      getState().data.removeProject(id);
      return;
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
};