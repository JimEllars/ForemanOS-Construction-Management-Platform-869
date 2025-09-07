-- ============================================================================
-- FOREMANOS RLS POLICY FIX
-- This SQL script fixes the registration error by creating proper RLS policies
-- ============================================================================

-- First, ensure RLS is enabled on all tables
ALTER TABLE profiles_fos2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies_fos2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_fos2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks_fos2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients_fos2025 ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 1: CRITICAL - Allow new users to create their profile during registration
-- ============================================================================

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Allow individual user insert" ON profiles_fos2025;
DROP POLICY IF EXISTS "Allow public insert for new profiles" ON profiles_fos2025;

-- Create the key policy that allows user registration
CREATE POLICY "Allow individual user insert" ON profiles_fos2025
  FOR INSERT 
  TO public, anon, authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- STEP 2: Allow users to read and update their own profile
-- ============================================================================

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Allow individual user read access" ON profiles_fos2025;
DROP POLICY IF EXISTS "Allow individual user update access" ON profiles_fos2025;

-- Allow users to read their own profile
CREATE POLICY "Allow individual user read access" ON profiles_fos2025
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY "Allow individual user update access" ON profiles_fos2025
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id);

-- ============================================================================
-- STEP 3: Company policies - Allow company creation and access
-- ============================================================================

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Allow company creation" ON companies_fos2025;
DROP POLICY IF EXISTS "Allow company members to read company data" ON companies_fos2025;
DROP POLICY IF EXISTS "Allow company members to update company data" ON companies_fos2025;

-- Allow new company creation during registration
CREATE POLICY "Allow company creation" ON companies_fos2025
  FOR INSERT 
  TO public, anon, authenticated
  WITH CHECK (true);

-- Allow company members to read their company data
CREATE POLICY "Allow company members to read company data" ON companies_fos2025
  FOR SELECT 
  TO authenticated
  USING (id = (SELECT company_id FROM profiles_fos2025 WHERE id = auth.uid()));

-- Allow company members to update their company data
CREATE POLICY "Allow company members to update company data" ON companies_fos2025
  FOR UPDATE 
  TO authenticated
  USING (id = (SELECT company_id FROM profiles_fos2025 WHERE id = auth.uid()));

-- ============================================================================
-- STEP 4: Projects policies
-- ============================================================================

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Allow company members to read projects" ON projects_fos2025;
DROP POLICY IF EXISTS "Allow company members to insert projects" ON projects_fos2025;
DROP POLICY IF EXISTS "Allow company members to update projects" ON projects_fos2025;
DROP POLICY IF EXISTS "Allow company members to delete projects" ON projects_fos2025;

-- Projects SELECT policy
CREATE POLICY "Allow company members to read projects" ON projects_fos2025
  FOR SELECT 
  TO authenticated
  USING (company_id = (SELECT company_id FROM profiles_fos2025 WHERE id = auth.uid()));

-- Projects INSERT policy
CREATE POLICY "Allow company members to insert projects" ON projects_fos2025
  FOR INSERT 
  TO authenticated
  WITH CHECK (company_id = (SELECT company_id FROM profiles_fos2025 WHERE id = auth.uid()));

-- Projects UPDATE policy
CREATE POLICY "Allow company members to update projects" ON projects_fos2025
  FOR UPDATE 
  TO authenticated
  USING (company_id = (SELECT company_id FROM profiles_fos2025 WHERE id = auth.uid()));

-- Projects DELETE policy
CREATE POLICY "Allow company members to delete projects" ON projects_fos2025
  FOR DELETE 
  TO authenticated
  USING (company_id = (SELECT company_id FROM profiles_fos2025 WHERE id = auth.uid()));

-- ============================================================================
-- STEP 5: Tasks policies
-- ============================================================================

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Allow company members to read tasks" ON tasks_fos2025;
DROP POLICY IF EXISTS "Allow company members to insert tasks" ON tasks_fos2025;
DROP POLICY IF EXISTS "Allow company members to update tasks" ON tasks_fos2025;
DROP POLICY IF EXISTS "Allow company members to delete tasks" ON tasks_fos2025;

-- Tasks SELECT policy (via project relationship)
CREATE POLICY "Allow company members to read tasks" ON tasks_fos2025
  FOR SELECT 
  TO authenticated
  USING (project_id IN (
    SELECT id FROM projects_fos2025 
    WHERE company_id = (SELECT company_id FROM profiles_fos2025 WHERE id = auth.uid())
  ));

-- Tasks INSERT policy
CREATE POLICY "Allow company members to insert tasks" ON tasks_fos2025
  FOR INSERT 
  TO authenticated
  WITH CHECK (project_id IN (
    SELECT id FROM projects_fos2025 
    WHERE company_id = (SELECT company_id FROM profiles_fos2025 WHERE id = auth.uid())
  ));

-- Tasks UPDATE policy
CREATE POLICY "Allow company members to update tasks" ON tasks_fos2025
  FOR UPDATE 
  TO authenticated
  USING (project_id IN (
    SELECT id FROM projects_fos2025 
    WHERE company_id = (SELECT company_id FROM profiles_fos2025 WHERE id = auth.uid())
  ));

-- Tasks DELETE policy
CREATE POLICY "Allow company members to delete tasks" ON tasks_fos2025
  FOR DELETE 
  TO authenticated
  USING (project_id IN (
    SELECT id FROM projects_fos2025 
    WHERE company_id = (SELECT company_id FROM profiles_fos2025 WHERE id = auth.uid())
  ));

-- ============================================================================
-- STEP 6: Clients policies
-- ============================================================================

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Allow company members to read clients" ON clients_fos2025;
DROP POLICY IF EXISTS "Allow company members to insert clients" ON clients_fos2025;
DROP POLICY IF EXISTS "Allow company members to update clients" ON clients_fos2025;
DROP POLICY IF EXISTS "Allow company members to delete clients" ON clients_fos2025;

-- Clients SELECT policy
CREATE POLICY "Allow company members to read clients" ON clients_fos2025
  FOR SELECT 
  TO authenticated
  USING (company_id = (SELECT company_id FROM profiles_fos2025 WHERE id = auth.uid()));

-- Clients INSERT policy
CREATE POLICY "Allow company members to insert clients" ON clients_fos2025
  FOR INSERT 
  TO authenticated
  WITH CHECK (company_id = (SELECT company_id FROM profiles_fos2025 WHERE id = auth.uid()));

-- Clients UPDATE policy
CREATE POLICY "Allow company members to update clients" ON clients_fos2025
  FOR UPDATE 
  TO authenticated
  USING (company_id = (SELECT company_id FROM profiles_fos2025 WHERE id = auth.uid()));

-- Clients DELETE policy
CREATE POLICY "Allow company members to delete clients" ON clients_fos2025
  FOR DELETE 
  TO authenticated
  USING (company_id = (SELECT company_id FROM profiles_fos2025 WHERE id = auth.uid()));

-- ============================================================================
-- VERIFICATION: Check that policies are created correctly
-- ============================================================================

-- List all policies to verify they were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN (
  'profiles_fos2025',
  'companies_fos2025', 
  'projects_fos2025',
  'tasks_fos2025',
  'clients_fos2025'
)
ORDER BY tablename, policyname;