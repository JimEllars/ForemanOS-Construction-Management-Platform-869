import { supabase } from '../lib/supabaseClient';
import { DailyLog } from '../types';

const TABLE_NAME = 'daily_logs_fos2025';

export const dailyLogService = {
  /**
   * Get all daily logs for a company's projects
   */
  async getDailyLogsByCompany(companyId: string): Promise<DailyLog[]> {
    try {
      console.log('🔍 Fetching daily logs for company:', companyId);

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
          *,
          projects_fos2025!inner(name, company_id),
          profiles_fos2025!daily_logs_fos2025_created_by_fkey(name)
        `)
        .eq('projects_fos2025.company_id', companyId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching daily logs:', error);
        throw error;
      }

      console.log('✅ Daily logs fetched:', (data || []).length);
      return (data || []).map(dailyLogService.transformDailyLogRecord);

    } catch (error: any) {
      console.error('❌ Failed to fetch daily logs:', error);
      throw error;
    }
  },

  /**
   * Get daily logs for a specific project
   */
  async getDailyLogsByProject(projectId: string): Promise<DailyLog[]> {
    try {
      console.log('🔍 Fetching daily logs for project:', projectId);

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
          *,
          projects_fos2025!inner(name),
          profiles_fos2025!daily_logs_fos2025_created_by_fkey(name)
        `)
        .eq('project_id', projectId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching project daily logs:', error);
        throw error;
      }

      console.log('✅ Project daily logs fetched:', (data || []).length);
      return (data || []).map(dailyLogService.transformDailyLogRecord);

    } catch (error: any) {
      console.error('❌ Failed to fetch project daily logs:', error);
      throw error;
    }
  },

  /**
   * Create a new daily log
   */
  async createDailyLog(logData: Omit<DailyLog, 'id' | 'created_at' | 'updated_at' | 'project_name' | 'created_by_name'>): Promise<DailyLog> {
    try {
      console.log('📝 Creating new daily log:', logData.date, 'for project:', logData.project_id);

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .insert({
          ...logData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          projects_fos2025!inner(name),
          profiles_fos2025!daily_logs_fos2025_created_by_fkey(name)
        `)
        .single();

      if (error) {
        console.error('❌ Error creating daily log:', error);
        throw error;
      }

      console.log('✅ Daily log created successfully:', data.id);
      return dailyLogService.transformDailyLogRecord(data);

    } catch (error: any) {
      console.error('❌ Daily log creation failed:', error);
      throw error;
    }
  },

  /**
   * Update an existing daily log
   */
  async updateDailyLog(id: string, updates: Partial<DailyLog>): Promise<DailyLog> {
    try {
      console.log('📝 Updating daily log:', id);

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          projects_fos2025!inner(name),
          profiles_fos2025!daily_logs_fos2025_created_by_fkey(name)
        `)
        .single();

      if (error) {
        console.error('❌ Error updating daily log:', error);
        throw error;
      }

      console.log('✅ Daily log updated successfully');
      return dailyLogService.transformDailyLogRecord(data);

    } catch (error: any) {
      console.error('❌ Daily log update failed:', error);
      throw error;
    }
  },

  /**
   * Delete a daily log
   */
  async deleteDailyLog(id: string): Promise<void> {
    try {
      console.log('🗑️ Deleting daily log:', id);

      const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting daily log:', error);
        throw error;
      }

      console.log('✅ Daily log deleted successfully');

    } catch (error: any) {
      console.error('❌ Daily log deletion failed:', error);
      throw error;
    }
  },

  /**
   * Get daily logs for a specific date range
   */
  async getDailyLogsByDateRange(
    companyId: string, 
    startDate: string, 
    endDate: string
  ): Promise<DailyLog[]> {
    try {
      console.log('🔍 Fetching daily logs for date range:', startDate, 'to', endDate);

      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select(`
          *,
          projects_fos2025!inner(name, company_id),
          profiles_fos2025!daily_logs_fos2025_created_by_fkey(name)
        `)
        .eq('projects_fos2025.company_id', companyId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) {
        console.error('❌ Error fetching daily logs by date range:', error);
        throw error;
      }

      console.log('✅ Daily logs fetched for date range:', (data || []).length);
      return (data || []).map(dailyLogService.transformDailyLogRecord);

    } catch (error: any) {
      console.error('❌ Failed to fetch daily logs by date range:', error);
      throw error;
    }
  },

  /**
   * Get weather statistics for reporting
   */
  async getWeatherStatistics(companyId: string, days: number = 30): Promise<{
    weather: string;
    count: number;
    percentage: number;
  }[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const logs = await dailyLogService.getDailyLogsByDateRange(
        companyId, 
        startDateStr, 
        new Date().toISOString().split('T')[0]
      );

      const weatherCounts: { [key: string]: number } = {};
      let totalLogs = 0;

      logs.forEach(log => {
        if (log.weather) {
          weatherCounts[log.weather] = (weatherCounts[log.weather] || 0) + 1;
          totalLogs++;
        }
      });

      return Object.entries(weatherCounts).map(([weather, count]) => ({
        weather,
        count,
        percentage: Math.round((count / totalLogs) * 100)
      })).sort((a, b) => b.count - a.count);

    } catch (error: any) {
      console.error('❌ Failed to get weather statistics:', error);
      throw error;
    }
  },

  /**
   * Check if a daily log exists for a specific project and date
   */
  async checkLogExists(projectId: string, date: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('id')
        .eq('project_id', projectId)
        .eq('date', date)
        .limit(1);

      if (error) {
        console.error('❌ Error checking log existence:', error);
        return false;
      }

      return (data || []).length > 0;

    } catch (error: any) {
      console.error('❌ Failed to check log existence:', error);
      return false;
    }
  },

  /**
   * Get productivity insights based on daily logs
   */
  async getProductivityInsights(companyId: string, days: number = 30): Promise<{
    totalLogs: number;
    averageWorkHours: number;
    mostActiveProject: string | null;
    weatherDelays: number;
    completionTrends: { date: string; logsCount: number }[];
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const logs = await dailyLogService.getDailyLogsByDateRange(
        companyId, 
        startDateStr, 
        new Date().toISOString().split('T')[0]
      );

      // Calculate metrics
      const totalLogs = logs.length;
      const weatherDelays = logs.filter(log => 
        log.weather === 'rainy' || 
        log.notes?.toLowerCase().includes('delay') ||
        log.notes?.toLowerCase().includes('weather')
      ).length;

      // Project activity analysis
      const projectActivity: { [key: string]: number } = {};
      logs.forEach(log => {
        if (log.project_name) {
          projectActivity[log.project_name] = (projectActivity[log.project_name] || 0) + 1;
        }
      });

      const mostActiveProject = Object.keys(projectActivity).length > 0
        ? Object.entries(projectActivity).sort(([,a], [,b]) => b - a)[0][0]
        : null;

      // Daily completion trends
      const dailyTrends: { [key: string]: number } = {};
      logs.forEach(log => {
        const date = log.date;
        dailyTrends[date] = (dailyTrends[date] || 0) + 1;
      });

      const completionTrends = Object.entries(dailyTrends)
        .map(([date, logsCount]) => ({ date, logsCount }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-14); // Last 14 days

      return {
        totalLogs,
        averageWorkHours: totalLogs > 0 ? Math.round((totalLogs * 8) / days * 10) / 10 : 0,
        mostActiveProject,
        weatherDelays,
        completionTrends
      };

    } catch (error: any) {
      console.error('❌ Failed to get productivity insights:', error);
      throw error;
    }
  },

  /**
   * Transform database record to frontend DailyLog type
   */
  transformDailyLogRecord(record: any): DailyLog {
    return {
      id: record.id,
      project_id: record.project_id,
      project_name: record.projects_fos2025?.name || 'Unknown Project',
      date: record.date,
      weather: record.weather,
      work_completed: record.work_completed,
      materials_used: record.materials_used,
      crew_present: record.crew_present,
      notes: record.notes,
      created_by: record.created_by,
      created_by_name: record.profiles_fos2025?.name || 'Unknown User',
      created_at: record.created_at,
      updated_at: record.updated_at
    };
  },

  /**
   * Validate daily log data before submission
   */
  validateDailyLog(logData: Partial<DailyLog>): string[] {
    const errors: string[] = [];

    if (!logData.project_id) {
      errors.push('Project is required');
    }

    if (!logData.date) {
      errors.push('Date is required');
    }

    if (!logData.work_completed || logData.work_completed.trim().length < 10) {
      errors.push('Work completed description must be at least 10 characters');
    }

    // Validate date format and not in future
    if (logData.date) {
      const logDate = new Date(logData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      if (logDate > today) {
        errors.push('Daily log date cannot be in the future');
      }
    }

    return errors;
  }
};