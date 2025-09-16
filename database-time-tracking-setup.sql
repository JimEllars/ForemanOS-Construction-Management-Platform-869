-- ============================================================================
-- TIME TRACKING TABLE SETUP FOR FOREMANOS
-- This script creates the time_entries table with proper relationships and RLS
-- ============================================================================

-- Step 1: Create time_entries table
CREATE TABLE IF NOT EXISTS time_entries_fos2025 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects_fos2025(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks_fos2025(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles_fos2025(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_hours DECIMAL(10,2),
  description TEXT,
  is_running BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time IS NULL OR end_time > start_time),
  CONSTRAINT valid_duration CHECK (duration_hours IS NULL OR duration_hours >= 0),
  CONSTRAINT running_timer_logic CHECK (
    (is_running = true AND end_time IS NULL AND duration_hours IS NULL) OR
    (is_running = false AND end_time IS NOT NULL AND duration_hours IS NOT NULL)
  )
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries_fos2025(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries_fos2025(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries_fos2025(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries_fos2025(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_time_entries_is_running ON time_entries_fos2025(is_running);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_running ON time_entries_fos2025(user_id, is_running);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_date ON time_entries_fos2025(project_id, start_time DESC);

-- Step 3: Enable Row Level Security
ALTER TABLE time_entries_fos2025 ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for time_entries table
-- Users can only access time entries from projects in their company

-- SELECT policy - users can view time entries from their company's projects
CREATE POLICY "time_entries_select_by_company" ON time_entries_fos2025
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects_fos2025 p 
      JOIN profiles_fos2025 pr ON p.company_id = pr.company_id 
      WHERE pr.id = auth.uid()
    )
  );

-- INSERT policy - users can create time entries for their company's projects
CREATE POLICY "time_entries_insert_by_company" ON time_entries_fos2025
  FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT p.id 
      FROM projects_fos2025 p 
      JOIN profiles_fos2025 pr ON p.company_id = pr.company_id 
      WHERE pr.id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- UPDATE policy - users can update their own time entries in their company
CREATE POLICY "time_entries_update_by_user" ON time_entries_fos2025
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    AND project_id IN (
      SELECT p.id 
      FROM projects_fos2025 p 
      JOIN profiles_fos2025 pr ON p.company_id = pr.company_id 
      WHERE pr.id = auth.uid()
    )
  );

-- DELETE policy - users can delete their own time entries in their company
CREATE POLICY "time_entries_delete_by_user" ON time_entries_fos2025
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    AND project_id IN (
      SELECT p.id 
      FROM projects_fos2025 p 
      JOIN profiles_fos2025 pr ON p.company_id = pr.company_id 
      WHERE pr.id = auth.uid()
    )
  );

-- Step 5: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_time_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER time_entries_updated_at_trigger
  BEFORE UPDATE ON time_entries_fos2025
  FOR EACH ROW
  EXECUTE FUNCTION update_time_entries_updated_at();

-- Step 6: Create helper functions for time tracking analytics

-- Function to get time tracking statistics
CREATE OR REPLACE FUNCTION get_time_tracking_stats_fos2025(company_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  total_hours NUMERIC,
  total_entries BIGINT,
  active_timers BIGINT,
  most_active_project TEXT,
  average_session_hours NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH time_stats AS (
    SELECT 
      COALESCE(SUM(te.duration_hours), 0) as total_hours,
      COUNT(*) as total_entries,
      COUNT(CASE WHEN te.is_running THEN 1 END) as active_timers
    FROM time_entries_fos2025 te
    JOIN projects_fos2025 p ON te.project_id = p.id
    WHERE p.company_id = company_uuid
      AND te.start_time >= CURRENT_DATE - INTERVAL '1 day' * days_back
  ),
  project_activity AS (
    SELECT 
      p.name as project_name,
      SUM(COALESCE(te.duration_hours, 0)) as total_project_hours
    FROM time_entries_fos2025 te
    JOIN projects_fos2025 p ON te.project_id = p.id
    WHERE p.company_id = company_uuid
      AND te.start_time >= CURRENT_DATE - INTERVAL '1 day' * days_back
    GROUP BY p.name
    ORDER BY total_project_hours DESC
    LIMIT 1
  )
  SELECT 
    ts.total_hours,
    ts.total_entries,
    ts.active_timers,
    COALESCE(pa.project_name, 'No data') as most_active_project,
    CASE 
      WHEN ts.total_entries > 0 THEN ROUND(ts.total_hours / ts.total_entries, 2)
      ELSE 0
    END as average_session_hours
  FROM time_stats ts
  LEFT JOIN project_activity pa ON true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily time breakdown
CREATE OR REPLACE FUNCTION get_daily_time_breakdown_fos2025(company_uuid UUID, days_back INTEGER DEFAULT 14)
RETURNS TABLE (
  date_day DATE,
  total_hours NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    te.start_time::DATE as date_day,
    SUM(COALESCE(te.duration_hours, 0)) as total_hours
  FROM time_entries_fos2025 te
  JOIN projects_fos2025 p ON te.project_id = p.id
  WHERE p.company_id = company_uuid
    AND te.start_time >= CURRENT_DATE - INTERVAL '1 day' * days_back
    AND te.duration_hours IS NOT NULL
  GROUP BY te.start_time::DATE
  ORDER BY date_day DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to stop all running timers for a user (for cleanup)
CREATE OR REPLACE FUNCTION stop_all_running_timers_fos2025(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  stopped_count INTEGER := 0;
  timer_record RECORD;
  duration_calc NUMERIC;
BEGIN
  FOR timer_record IN 
    SELECT id, start_time 
    FROM time_entries_fos2025 
    WHERE user_id = user_uuid AND is_running = true
  LOOP
    -- Calculate duration in hours
    duration_calc := EXTRACT(EPOCH FROM (NOW() - timer_record.start_time)) / 3600.0;
    
    -- Update the timer
    UPDATE time_entries_fos2025 
    SET 
      end_time = NOW(),
      duration_hours = ROUND(duration_calc, 2),
      is_running = false,
      updated_at = NOW()
    WHERE id = timer_record.id;
    
    stopped_count := stopped_count + 1;
  END LOOP;
  
  RETURN stopped_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SAMPLE DATA INSERTION (Optional - for testing)
-- ============================================================================

-- Insert sample time entries (uncomment and replace UUIDs with actual values)
/*
-- Get sample project, task, and user IDs first
WITH sample_data AS (
  SELECT 
    p.id as project_id,
    t.id as task_id,
    pr.id as user_id
  FROM projects_fos2025 p
  JOIN tasks_fos2025 t ON t.project_id = p.id
  JOIN profiles_fos2025 pr ON p.company_id = pr.company_id
  LIMIT 1
)
INSERT INTO time_entries_fos2025 (
  project_id,
  task_id,
  user_id,
  start_time,
  end_time,
  duration_hours,
  description,
  is_running
)
SELECT 
  sd.project_id,
  sd.task_id,
  sd.user_id,
  CURRENT_TIMESTAMP - INTERVAL '4 hours',
  CURRENT_TIMESTAMP,
  4.0,
  'Foundation excavation work - north section completed',
  false
FROM sample_data sd;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'time_entries_fos2025' 
ORDER BY ordinal_position;

-- Verify indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'time_entries_fos2025';

-- Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'time_entries_fos2025'
ORDER BY policyname;

-- Verify helper functions
SELECT routine_name, routine_type, routine_definition
FROM information_schema.routines
WHERE routine_name LIKE '%time%fos2025%'
  AND routine_schema = 'public'
ORDER BY routine_name;

-- Test constraints
SELECT conname, contype, consrc
FROM pg_constraint 
WHERE conrelid = 'time_entries_fos2025'::regclass;

SELECT 'Time tracking table and policies created successfully!' as status;