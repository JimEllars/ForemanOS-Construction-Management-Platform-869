-- ============================================================================
-- DAILY LOGS TABLE SETUP FOR FOREMANOS
-- This script creates the daily_logs table with proper relationships and RLS
-- ============================================================================

-- Step 1: Create daily_logs table
CREATE TABLE IF NOT EXISTS daily_logs_fos2025 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects_fos2025(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weather TEXT CHECK (weather IN ('sunny', 'cloudy', 'rainy', 'snowy', 'windy')),
  work_completed TEXT NOT NULL CHECK (length(work_completed) >= 10),
  materials_used TEXT,
  crew_present TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles_fos2025(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one log per project per date per user (allow multiple users to log same project/date)
  UNIQUE(project_id, date, created_by)
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_logs_project_id ON daily_logs_fos2025(project_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs_fos2025(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_logs_created_by ON daily_logs_fos2025(created_by);
CREATE INDEX IF NOT EXISTS idx_daily_logs_weather ON daily_logs_fos2025(weather);
CREATE INDEX IF NOT EXISTS idx_daily_logs_project_date ON daily_logs_fos2025(project_id, date DESC);

-- Step 3: Enable Row Level Security
ALTER TABLE daily_logs_fos2025 ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for daily_logs table
-- Users can only access logs from projects in their company

-- SELECT policy - users can view logs from their company's projects
CREATE POLICY "daily_logs_select_by_company" ON daily_logs_fos2025
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects_fos2025 p 
      JOIN profiles_fos2025 pr ON p.company_id = pr.company_id 
      WHERE pr.id = auth.uid()
    )
  );

-- INSERT policy - users can create logs for their company's projects
CREATE POLICY "daily_logs_insert_by_company" ON daily_logs_fos2025
  FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT p.id 
      FROM projects_fos2025 p 
      JOIN profiles_fos2025 pr ON p.company_id = pr.company_id 
      WHERE pr.id = auth.uid()
    )
    AND created_by = auth.uid()
  );

-- UPDATE policy - users can update logs they created in their company
CREATE POLICY "daily_logs_update_by_creator" ON daily_logs_fos2025
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    AND project_id IN (
      SELECT p.id 
      FROM projects_fos2025 p 
      JOIN profiles_fos2025 pr ON p.company_id = pr.company_id 
      WHERE pr.id = auth.uid()
    )
  );

-- DELETE policy - users can delete logs they created in their company
CREATE POLICY "daily_logs_delete_by_creator" ON daily_logs_fos2025
  FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    AND project_id IN (
      SELECT p.id 
      FROM projects_fos2025 p 
      JOIN profiles_fos2025 pr ON p.company_id = pr.company_id 
      WHERE pr.id = auth.uid()
    )
  );

-- Step 5: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_daily_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER daily_logs_updated_at_trigger
  BEFORE UPDATE ON daily_logs_fos2025
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_logs_updated_at();

-- Step 6: Create helper functions for analytics

-- Function to get weather statistics
CREATE OR REPLACE FUNCTION get_weather_stats_fos2025(company_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  weather_condition TEXT,
  log_count BIGINT,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH weather_counts AS (
    SELECT 
      COALESCE(dl.weather, 'unknown') as weather_type,
      COUNT(*) as count
    FROM daily_logs_fos2025 dl
    JOIN projects_fos2025 p ON dl.project_id = p.id
    WHERE p.company_id = company_uuid
      AND dl.date >= CURRENT_DATE - INTERVAL '1 day' * days_back
    GROUP BY dl.weather
  ),
  total_count AS (
    SELECT SUM(count) as total FROM weather_counts
  )
  SELECT 
    wc.weather_type,
    wc.count,
    ROUND((wc.count::NUMERIC / tc.total::NUMERIC) * 100, 1) as percentage
  FROM weather_counts wc, total_count tc
  ORDER BY wc.count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get productivity insights
CREATE OR REPLACE FUNCTION get_productivity_insights_fos2025(company_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  total_logs BIGINT,
  active_days BIGINT,
  most_active_project TEXT,
  weather_delays BIGINT,
  avg_daily_logs NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH log_stats AS (
    SELECT 
      COUNT(*) as total_logs,
      COUNT(DISTINCT dl.date) as active_days,
      COUNT(CASE WHEN dl.weather = 'rainy' OR 
                       LOWER(dl.notes) LIKE '%delay%' OR 
                       LOWER(dl.notes) LIKE '%weather%' 
                  THEN 1 END) as weather_delays
    FROM daily_logs_fos2025 dl
    JOIN projects_fos2025 p ON dl.project_id = p.id
    WHERE p.company_id = company_uuid
      AND dl.date >= CURRENT_DATE - INTERVAL '1 day' * days_back
  ),
  project_activity AS (
    SELECT 
      p.name as project_name,
      COUNT(*) as log_count
    FROM daily_logs_fos2025 dl
    JOIN projects_fos2025 p ON dl.project_id = p.id
    WHERE p.company_id = company_uuid
      AND dl.date >= CURRENT_DATE - INTERVAL '1 day' * days_back
    GROUP BY p.name
    ORDER BY log_count DESC
    LIMIT 1
  )
  SELECT 
    ls.total_logs,
    ls.active_days,
    COALESCE(pa.project_name, 'No data') as most_active_project,
    ls.weather_delays,
    CASE 
      WHEN ls.active_days > 0 THEN ROUND(ls.total_logs::NUMERIC / ls.active_days::NUMERIC, 1)
      ELSE 0
    END as avg_daily_logs
  FROM log_stats ls
  LEFT JOIN project_activity pa ON true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SAMPLE DATA INSERTION (Optional - for testing)
-- ============================================================================

-- Insert sample daily logs (uncomment and replace UUIDs with actual values)
/*
-- Get sample project and user IDs first
WITH sample_data AS (
  SELECT 
    p.id as project_id,
    pr.id as user_id
  FROM projects_fos2025 p
  JOIN profiles_fos2025 pr ON p.company_id = pr.company_id
  LIMIT 1
)
INSERT INTO daily_logs_fos2025 (
  project_id,
  date,
  weather,
  work_completed,
  materials_used,
  crew_present,
  notes,
  created_by
)
SELECT 
  sd.project_id,
  CURRENT_DATE - INTERVAL '1 day',
  'sunny',
  'Completed foundation excavation on the north side. Poured concrete for footings sections A-C.',
  '15 cubic yards concrete, 2 tons rebar steel, 50 bags cement',
  'John Smith (Foreman), Mike Johnson (Operator), Sarah Davis (Laborer)',
  'Weather conditions were perfect for concrete work. No delays encountered.',
  sd.user_id
FROM sample_data sd;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'daily_logs_fos2025' 
ORDER BY ordinal_position;

-- Verify indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'daily_logs_fos2025';

-- Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'daily_logs_fos2025'
ORDER BY policyname;

-- Verify helper functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name LIKE '%fos2025%'
  AND routine_schema = 'public'
ORDER BY routine_name;

SELECT 'Daily logs table and policies created successfully!' as status;