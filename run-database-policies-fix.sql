-- COMPREHENSIVE RLS POLICY FIX FOR FOREMANOS
-- This script ensures all policies work correctly for authentication

-- First, ensure RLS is enabled on all tables
ALTER TABLE profiles_fos2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies_fos2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_fos2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks_fos2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients_fos2025 ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles_fos2025;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles_fos2025;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles_fos2025;
DROP POLICY IF EXISTS "companies_insert_public" ON companies_fos2025;
DROP POLICY IF EXISTS "companies_select_all" ON companies_fos2025;
DROP POLICY IF EXISTS "companies_update_all" ON companies_fos2025;

-- PROFILES TABLE: Allow users to manage their own profile
CREATE POLICY "profiles_insert_own" ON profiles_fos2025
FOR INSERT TO public, anon, authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_select_own" ON profiles_fos2025
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles_fos2025
FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- COMPANIES TABLE: Allow creation and access
CREATE POLICY "companies_insert_all" ON companies_fos2025
FOR INSERT TO public, anon, authenticated
WITH CHECK (true);

CREATE POLICY "companies_select_all" ON companies_fos2025
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "companies_update_by_member" ON companies_fos2025
FOR UPDATE TO authenticated
USING (
  id IN (
    SELECT company_id 
    FROM profiles_fos2025 
    WHERE id = auth.uid()
  )
);

-- PROJECTS TABLE: Company-based access
DROP POLICY IF EXISTS "projects_select_by_company" ON projects_fos2025;
DROP POLICY IF EXISTS "projects_insert_by_company" ON projects_fos2025;
DROP POLICY IF EXISTS "projects_update_by_company" ON projects_fos2025;
DROP POLICY IF EXISTS "projects_delete_by_company" ON projects_fos2025;

CREATE POLICY "projects_select_by_company" ON projects_fos2025
FOR SELECT TO authenticated
USING (
  company_id IN (
    SELECT company_id 
    FROM profiles_fos2025 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "projects_insert_by_company" ON projects_fos2025
FOR INSERT TO authenticated
WITH CHECK (
  company_id IN (
    SELECT company_id 
    FROM profiles_fos2025 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "projects_update_by_company" ON projects_fos2025
FOR UPDATE TO authenticated
USING (
  company_id IN (
    SELECT company_id 
    FROM profiles_fos2025 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "projects_delete_by_company" ON projects_fos2025
FOR DELETE TO authenticated
USING (
  company_id IN (
    SELECT company_id 
    FROM profiles_fos2025 
    WHERE id = auth.uid()
  )
);

-- TASKS TABLE: Project-based access
DROP POLICY IF EXISTS "tasks_select_all" ON tasks_fos2025;
DROP POLICY IF EXISTS "tasks_insert_all" ON tasks_fos2025;
DROP POLICY IF EXISTS "tasks_update_all" ON tasks_fos2025;
DROP POLICY IF EXISTS "tasks_delete_all" ON tasks_fos2025;

CREATE POLICY "tasks_select_by_project" ON tasks_fos2025
FOR SELECT TO authenticated
USING (
  project_id IN (
    SELECT p.id 
    FROM projects_fos2025 p
    JOIN profiles_fos2025 pr ON p.company_id = pr.company_id
    WHERE pr.id = auth.uid()
  )
);

CREATE POLICY "tasks_insert_by_project" ON tasks_fos2025
FOR INSERT TO authenticated
WITH CHECK (
  project_id IN (
    SELECT p.id 
    FROM projects_fos2025 p
    JOIN profiles_fos2025 pr ON p.company_id = pr.company_id
    WHERE pr.id = auth.uid()
  )
);

CREATE POLICY "tasks_update_by_project" ON tasks_fos2025
FOR UPDATE TO authenticated
USING (
  project_id IN (
    SELECT p.id 
    FROM projects_fos2025 p
    JOIN profiles_fos2025 pr ON p.company_id = pr.company_id
    WHERE pr.id = auth.uid()
  )
);

CREATE POLICY "tasks_delete_by_project" ON tasks_fos2025
FOR DELETE TO authenticated
USING (
  project_id IN (
    SELECT p.id 
    FROM projects_fos2025 p
    JOIN profiles_fos2025 pr ON p.company_id = pr.company_id
    WHERE pr.id = auth.uid()
  )
);

-- CLIENTS TABLE: Company-based access
DROP POLICY IF EXISTS "clients_select_all" ON clients_fos2025;
DROP POLICY IF EXISTS "clients_insert_all" ON clients_fos2025;
DROP POLICY IF EXISTS "clients_update_all" ON clients_fos2025;
DROP POLICY IF EXISTS "clients_delete_all" ON clients_fos2025;

CREATE POLICY "clients_select_by_company" ON clients_fos2025
FOR SELECT TO authenticated
USING (
  company_id IN (
    SELECT company_id 
    FROM profiles_fos2025 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "clients_insert_by_company" ON clients_fos2025
FOR INSERT TO authenticated
WITH CHECK (
  company_id IN (
    SELECT company_id 
    FROM profiles_fos2025 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "clients_update_by_company" ON clients_fos2025
FOR UPDATE TO authenticated
USING (
  company_id IN (
    SELECT company_id 
    FROM profiles_fos2025 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "clients_delete_by_company" ON clients_fos2025
FOR DELETE TO authenticated
USING (
  company_id IN (
    SELECT company_id 
    FROM profiles_fos2025 
    WHERE id = auth.uid()
  )
);

-- Verify all policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename IN (
  'profiles_fos2025',
  'companies_fos2025', 
  'projects_fos2025',
  'tasks_fos2025',
  'clients_fos2025'
)
ORDER BY tablename, policyname;

SELECT 'RLS policies have been completely rebuilt and should now work correctly for authentication' as status;