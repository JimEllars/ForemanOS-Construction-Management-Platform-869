import { supabase } from '../lib/supabaseClient';
import { TimeEntry } from '../types';
import { useStore } from '../store';

const TABLE_NAME = 'time_entries_fos2025';
const { getState } = useStore;

export const timeTrackingService = {
  /**
   * Get all time entries for a company's projects
   */
  async getTimeEntriesByCompany(companyId: string): Promise<TimeEntry[]> {
    try {
      console.log('🔍 Fetching time entries for company:', companyId);

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
          *,
          projects_fos2025!inner(name, company_id),
          tasks_fos2025(title),
          profiles_fos2025!time_entries_fos2025_user_id_fkey(name)
        `)
        .eq('projects_fos2025.company_id', companyId)
        .order('start_time', { ascending: false });

      if (error) {
        console.error('❌ Error fetching time entries:', error);
        throw error;
      }

      console.log('✅ Time entries fetched:', (data || []).length);
      return (data || []).map(timeTrackingService.transformTimeEntryRecord);

    } catch (error: any) {
      console.error('❌ Failed to fetch time entries:', error);
      throw error;
    }
  },

  /**
   * Get time entries for a specific project
   */
  async getTimeEntriesByProject(projectId: string): Promise<TimeEntry[]> {
    try {
      console.log('🔍 Fetching time entries for project:', projectId);

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
          *,
          projects_fos2025!inner(name),
          tasks_fos2025(title),
          profiles_fos2025!time_entries_fos2025_user_id_fkey(name)
        `)
        .eq('project_id', projectId)
        .order('start_time', { ascending: false });

      if (error) {
        console.error('❌ Error fetching project time entries:', error);
        throw error;
      }

      console.log('✅ Project time entries fetched:', (data || []).length);
      return (data || []).map(timeTrackingService.transformTimeEntryRecord);

    } catch (error: any) {
      console.error('❌ Failed to fetch project time entries:', error);
      throw error;
    }
  },

  /**
   * Create a new time entry
   */
  async createTimeEntry(entryData: Omit<TimeEntry, 'id' | 'created_at' | 'updated_at' | 'project_name' | 'task_name' | 'user_name'>): Promise<TimeEntry> {
    const { isOnline, addPendingChange } = getState().offline;
    const { data: dataState } = getState();

    if (!isOnline) {
      const tempId = `temp_${Date.now()}`;
      const optimisticEntry: TimeEntry = {
        ...entryData,
        id: tempId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        syncStatus: 'pending',
        project_name: dataState.projects.find(p => p.id === entryData.project_id)?.name || 'Unknown Project',
        task_name: entryData.task_id ? dataState.tasks.find(t => t.id === entryData.task_id)?.title || null : null,
        user_name: getState().auth.user?.name || 'Unknown User',
      };
      addPendingChange({ type: 'CREATE', entity: 'time_entry', payload: entryData, tempId });
      getState().timeTracking.addTimeEntry(optimisticEntry);
      return optimisticEntry;
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert({ ...entryData, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .select('*, projects_fos2025!inner(name), tasks_fos2025(title), profiles_fos2025!time_entries_fos2025_user_id_fkey(name)')
      .single();

    if (error) {
      console.error('❌ Error creating time entry:', error);
      throw error;
    }
    return timeTrackingService.transformTimeEntryRecord(data);
  },

  /**
   * Update an existing time entry
   */
  async updateTimeEntry(id: string, updates: Partial<TimeEntry>): Promise<TimeEntry> {
    const { isOnline, addPendingChange } = getState().offline;

    if (!isOnline) {
      addPendingChange({ type: 'UPDATE', entity: 'time_entry', payload: { id, ...updates } });
      const updatedEntry = { ...getState().timeTracking.timeEntries.find(t => t.id === id), ...updates, syncStatus: 'pending' } as TimeEntry;
      getState().timeTracking.updateTimeEntry(id, updatedEntry);
      if (updates.is_running === false) {
        getState().timeTracking.setRunningTimer(null);
      }
      return updatedEntry;
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, projects_fos2025!inner(name), tasks_fos2025(title), profiles_fos2025!time_entries_fos2025_user_id_fkey(name)')
      .single();

    if (error) {
      console.error('❌ Error updating time entry:', error);
      throw error;
    }
    return timeTrackingService.transformTimeEntryRecord(data);
  },

  /**
   * Delete a time entry
   */
  async deleteTimeEntry(id: string): Promise<void> {
    const { isOnline, addPendingChange } = getState().offline;

    if (!isOnline) {
      addPendingChange({ type: 'DELETE', entity: 'time_entry', payload: { id } });
      getState().timeTracking.removeTimeEntry(id);
      return;
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting time entry:', error);
      throw error;
    }
  },

  /**
   * Start a new timer
   */
  async startTimer(projectId: string, taskId: string | null, userId: string, description?: string): Promise<TimeEntry> {
    try {
      console.log('▶️ Starting timer for project:', projectId);

      // First, stop any running timers for this user
      await timeTrackingService.stopAllRunningTimers(userId);

      const entryData = {
        project_id: projectId,
        task_id: taskId,
        user_id: userId,
        start_time: new Date().toISOString(),
        end_time: null,
        duration_hours: null,
        description: description || '',
        is_running: true
      };

      return await timeTrackingService.createTimeEntry(entryData);

    } catch (error: any) {
      console.error('❌ Failed to start timer:', error);
      throw error;
    }
  },

  /**
   * Stop a running timer
   */
  async stopTimer(id: string): Promise<TimeEntry> {
    try {
      console.log('⏹️ Stopping timer:', id);

      // Get the current entry to calculate duration
      const { data: currentEntry, error: fetchError } = await supabase
        .from(TABLE_NAME)
        .select('start_time, end_time')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const endTime = new Date().toISOString();
      const startTime = new Date(currentEntry.start_time);
      const durationMs = new Date(endTime).getTime() - startTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60); // Convert to hours

      const updates = {
        end_time: endTime,
        duration_hours: Math.round(durationHours * 100) / 100, // Round to 2 decimal places
        is_running: false
      };

      return await timeTrackingService.updateTimeEntry(id, updates);

    } catch (error: any) {
      console.error('❌ Failed to stop timer:', error);
      throw error;
    }
  },

  /**
   * Stop all running timers for a user
   */
  async stopAllRunningTimers(userId: string): Promise<void> {
    try {
      console.log('⏸️ Stopping all running timers for user:', userId);

      const { data: runningTimers, error: fetchError } = await supabase
        .from(TABLE_NAME)
        .select('id, start_time')
        .eq('user_id', userId)
        .eq('is_running', true);

      if (fetchError) {
        throw fetchError;
      }

      if (runningTimers && runningTimers.length > 0) {
        const endTime = new Date().toISOString();

        for (const timer of runningTimers) {
          const startTime = new Date(timer.start_time);
          const durationMs = new Date(endTime).getTime() - startTime.getTime();
          const durationHours = durationMs / (1000 * 60 * 60);

          await supabase
            .from(TABLE_NAME)
            .update({
              end_time: endTime,
              duration_hours: Math.round(durationHours * 100) / 100,
              is_running: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', timer.id);
        }

        console.log('✅ Stopped', runningTimers.length, 'running timers');
      }

    } catch (error: any) {
      console.error('❌ Failed to stop running timers:', error);
      throw error;
    }
  },

  /**
   * Get running timer for a user
   */
  async getRunningTimer(userId: string): Promise<TimeEntry | null> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
          *,
          projects_fos2025!inner(name),
          tasks_fos2025(title),
          profiles_fos2025!time_entries_fos2025_user_id_fkey(name)
        `)
        .eq('user_id', userId)
        .eq('is_running', true)
        .order('start_time', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // No running timer found is not an error
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return timeTrackingService.transformTimeEntryRecord(data);

    } catch (error: any) {
      console.error('❌ Failed to get running timer:', error);
      return null;
    }
  },

  /**
   * Get time tracking statistics for a company
   */
  async getTimeTrackingStats(companyId: string, days: number = 30): Promise<{
    totalHours: number;
    totalEntries: number;
    activeTimers: number;
    mostActiveProject: string | null;
    averageSessionHours: number;
    dailyBreakdown: { date: string; hours: number }[];
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const { data: entries, error } = await supabase
        .from(TABLE_NAME)
        .select(`
          *,
          projects_fos2025!inner(name, company_id)
        `)
        .eq('projects_fos2025.company_id', companyId)
        .gte('start_time', startDateStr)
        .order('start_time', { ascending: false });

      if (error) {
        throw error;
      }

      const totalEntries = entries?.length || 0;
      const totalHours = entries?.reduce((sum, entry) => sum + (entry.duration_hours || 0), 0) || 0;
      const activeTimers = entries?.filter(entry => entry.is_running).length || 0;

      // Project activity analysis
      const projectActivity: { [key: string]: number } = {};
      entries?.forEach(entry => {
        const projectName = entry.projects_fos2025?.name;
        if (projectName) {
          projectActivity[projectName] = (projectActivity[projectName] || 0) + (entry.duration_hours || 0);
        }
      });

      const mostActiveProject = Object.keys(projectActivity).length > 0
        ? Object.entries(projectActivity).sort(([,a], [,b]) => b - a)[0][0]
        : null;

      const averageSessionHours = totalEntries > 0 ? totalHours / totalEntries : 0;

      // Daily breakdown
      const dailyHours: { [key: string]: number } = {};
      entries?.forEach(entry => {
        if (entry.duration_hours) {
          const date = entry.start_time.split('T')[0];
          dailyHours[date] = (dailyHours[date] || 0) + entry.duration_hours;
        }
      });

      const dailyBreakdown = Object.entries(dailyHours)
        .map(([date, hours]) => ({ date, hours }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14); // Last 14 days

      return {
        totalHours: Math.round(totalHours * 100) / 100,
        totalEntries,
        activeTimers,
        mostActiveProject,
        averageSessionHours: Math.round(averageSessionHours * 100) / 100,
        dailyBreakdown
      };

    } catch (error: any) {
      console.error('❌ Failed to get time tracking stats:', error);
      throw error;
    }
  },

  /**
   * Transform database record to frontend TimeEntry type
   */
  transformTimeEntryRecord(record: any): TimeEntry {
    return {
      id: record.id,
      project_id: record.project_id,
      project_name: record.projects_fos2025?.name || 'Unknown Project',
      task_id: record.task_id,
      task_name: record.tasks_fos2025?.title || null,
      user_id: record.user_id,
      user_name: record.profiles_fos2025?.name || 'Unknown User',
      start_time: record.start_time,
      end_time: record.end_time,
      duration_hours: record.duration_hours,
      description: record.description,
      is_running: record.is_running,
      created_at: record.created_at,
      updated_at: record.updated_at
    };
  },

  /**
   * Validate time entry data before submission
   */
  validateTimeEntry(entryData: Partial<TimeEntry>): string[] {
    const errors: string[] = [];

    if (!entryData.project_id) {
      errors.push('Project is required');
    }

    if (!entryData.user_id) {
      errors.push('User is required');
    }

    if (!entryData.start_time) {
      errors.push('Start time is required');
    }

    // If end_time is provided, validate it's after start_time
    if (entryData.start_time && entryData.end_time) {
      const startTime = new Date(entryData.start_time);
      const endTime = new Date(entryData.end_time);

      if (endTime <= startTime) {
        errors.push('End time must be after start time');
      }

      // Check for reasonable duration (max 24 hours)
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);

      if (durationHours > 24) {
        errors.push('Time entry cannot exceed 24 hours');
      }
    }

    return errors;
  },

  /**
   * Format duration for display
   */
  formatDuration(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  },

  /**
   * Calculate elapsed time for running timer
   */
  calculateElapsedTime(startTime: string): number {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = now.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
  }
};