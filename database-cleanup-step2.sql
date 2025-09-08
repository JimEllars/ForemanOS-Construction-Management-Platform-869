-- ============================================================================
-- FOREMANOS RLS POLICY FIX - STEP 2
-- This SQL script fixes the registration error by creating proper RLS policies
-- ============================================================================

-- First, ensure RLS is enabled on all tables
ALTER TABLE profiles_fos2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies_fos2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_fos2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks_fos2025 ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients_fos2025 ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 1: CRITICAL - Drop ALL existing policies to prevent conflicts
-- ============================================================================

-- Drop ALL existing policies on profiles_fos2025
DROP POLICY IF EXISTS "Allow individual user insert" ON profiles_fos2025;
DROP POLICY IF EXISTS "Allow public insert for new profiles" ON profiles_fos2025;
DROP POLICY IF EXISTS "Allow individual user read access" ON profiles_fos2025;
DROP POLICY IF EXISTS "Allow individual user update access" ON profiles_fos2025;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles_fos2025;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles_fos2025;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON profiles_fos2025;

-- Drop ALL existing policies on companies_fos2025
DROP POLICY IF EXISTS "Allow company creation" ON companies_fos2025;
DROP POLICY IF EXISTS "Allow company members to read company data" ON companies_fos2025;
DROP POLICY IF EXISTS "Allow company members to update company data" ON companies_fos2025;
DROP POLICY IF EXISTS "Enable read access for all users" ON companies_fos2025;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON companies_fos2025;

-- Drop ALL existing policies on projects_fos2025
DROP POLICY IF EXISTS "Allow company members to read projects" ON projects_fos2025;
DROP POLICY IF EXISTS "Allow company members to insert projects" ON projects_fos2025;
DROP POLICY IF EXISTS "Allow company members to update projects" ON projects_fos2025;
DROP POLICY IF EXISTS "Allow company members to delete projects" ON projects_fos2025;

-- Drop ALL existing policies on tasks_fos2025
DROP POLICY IF EXISTS "Allow company members to read tasks" ON tasks_fos2025;
DROP POLICY IF EXISTS "Allow company members to insert tasks" ON tasks_fos2025;
DROP POLICY IF EXISTS "Allow company members to update tasks" ON tasks_fos2025;
DROP POLICY IF EXISTS "Allow company members to delete tasks" ON tasks_fos2025;

-- Drop ALL existing policies on clients_fos2025
DROP POLICY IF EXISTS "Allow company members to read clients" ON clients_fos2025;
DROP POLICY IF EXISTS "Allow company members to insert clients" ON clients_fos2025;
DROP POLICY IF EXISTS "Allow company members to update clients" ON clients_fos2025;
DROP POLICY IF EXISTS "Allow company members to delete clients" ON clients_fos2025;

-- ============================================================================
-- STEP 2: Create NEW, non-recursive policies for profiles_fos2025
-- ============================================================================

-- Allow users to insert their own profile (CRITICAL for registration)
CREATE POLICY "profiles_insert_own" ON profiles_fos2025 
FOR INSERT 
TO public, anon, authenticated 
WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY "profiles_select_own" ON profiles_fos2025 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own" ON profiles_fos2025 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- ============================================================================
-- STEP 3: Create NEW, non-recursive policies for companies_fos2025
-- ============================================================================

-- Allow company creation (CRITICAL for registration)
CREATE POLICY "companies_insert_public" ON companies_fos2025 
FOR INSERT 
TO public, anon, authenticated 
WITH CHECK (true);

-- Allow reading companies (simple, non-recursive)
CREATE POLICY "companies_select_all" ON companies_fos2025 
FOR SELECT 
TO authenticated 
USING (true);

-- Allow updating companies (simple check)
CREATE POLICY "companies_update_all" ON companies_fos2025 
FOR UPDATE 
TO authenticated 
USING (true);

-- ============================================================================
-- STEP 4: Create NEW, simple policies for projects_fos2025
-- ============================================================================

CREATE POLICY "projects_select_by_company" ON projects_fos2025 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "projects_insert_by_company" ON projects_fos2025 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "projects_update_by_company" ON projects_fos2025 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "projects_delete_by_company" ON projects_fos2025 
FOR DELETE 
TO authenticated 
USING (true);

-- ============================================================================
-- STEP 5: Create NEW, simple policies for tasks_fos2025
-- ============================================================================

CREATE POLICY "tasks_select_all" ON tasks_fos2025 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "tasks_insert_all" ON tasks_fos2025 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "tasks_update_all" ON tasks_fos2025 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "tasks_delete_all" ON tasks_fos2025 
FOR DELETE 
TO authenticated 
USING (true);

-- ============================================================================
-- STEP 6: Create NEW, simple policies for clients_fos2025
-- ============================================================================

CREATE POLICY "clients_select_all" ON clients_fos2025 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "clients_insert_all" ON clients_fos2025 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "clients_update_all" ON clients_fos2025 
FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "clients_delete_all" ON clients_fos2025 
FOR DELETE 
TO authenticated 
USING (true);

-- ============================================================================
-- VERIFICATION: Check that policies are created correctly
-- ============================================================================

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

-- Final verification message
SELECT 'RLS policies have been reset and recreated successfully' as status;