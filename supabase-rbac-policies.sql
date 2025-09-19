-- ============================================================================
-- FOREMANOS RBAC POLICIES
-- This script implements Role-Based Access Control (RBAC) on top of the
-- existing company-based RLS policies.
--
-- Roles:
-- - admin: Can do everything within their company.
-- - manager: Can create, update, and delete projects, tasks, and clients.
-- - worker: Can only read projects, tasks, and clients.
-- ============================================================================

-- Helper function to get the role of the current user for their company
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.company_users
  WHERE user_id = auth.uid()
  AND company_id = (SELECT company_id FROM public.profiles_fos2025 WHERE id = auth.uid());

  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PROJECTS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow company members to read projects" ON projects_fos2025;
DROP POLICY IF EXISTS "Allow company members to insert projects" ON projects_fos2025;
DROP POLICY IF EXISTS "Allow company members to update projects" ON projects_fos2025;
DROP POLICY IF EXISTS "Allow company members to delete projects" ON projects_fos2025;

-- 1. SELECT (read) Policy: Any authenticated user in the company can read projects.
CREATE POLICY "Allow company members to read projects" ON projects_fos2025
  FOR SELECT
  TO authenticated
  USING (company_id = (SELECT company_id FROM public.profiles_fos2025 WHERE id = auth.uid()));

-- 2. INSERT (create) Policy: Only admins and managers can create projects.
CREATE POLICY "Allow admins and managers to insert projects" ON projects_fos2025
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles_fos2025 WHERE id = auth.uid()) AND
    (get_my_role() IN ('admin', 'manager'))
  );

-- 3. UPDATE Policy: Only admins and managers can update projects.
CREATE POLICY "Allow admins and managers to update projects" ON projects_fos2025
  FOR UPDATE
  TO authenticated
  USING (
    company_id = (SELECT company_id FROM public.profiles_fos2025 WHERE id = auth.uid()) AND
    (get_my_role() IN ('admin', 'manager'))
  );

-- 4. DELETE Policy: Only admins can delete projects.
CREATE POLICY "Allow admins to delete projects" ON projects_fos2025
  FOR DELETE
  TO authenticated
  USING (
    company_id = (SELECT company_id FROM public.profiles_fos2025 WHERE id = auth.uid()) AND
    (get_my_role() = 'admin')
  );

-- ============================================================================
-- TASKS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow company members to read tasks" ON tasks_fos2025;
DROP POLICY IF EXISTS "Allow company members to insert tasks" ON tasks_fos2025;
DROP POLICY IF EXISTS "Allow company members to update tasks" ON tasks_fos2025;
DROP POLICY IF EXISTS "Allow company members to delete tasks" ON tasks_fos2025;

-- 1. SELECT (read) Policy: Any authenticated user in the company can read tasks.
CREATE POLICY "Allow company members to read tasks" ON tasks_fos2025
  FOR SELECT
  TO authenticated
  USING (project_id IN (
    SELECT id FROM projects_fos2025
    WHERE company_id = (SELECT company_id FROM public.profiles_fos2025 WHERE id = auth.uid())
  ));

-- 2. INSERT (create) Policy: Only admins and managers can create tasks.
CREATE POLICY "Allow admins and managers to insert tasks" ON tasks_fos2025
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects_fos2025
      WHERE company_id = (SELECT company_id FROM public.profiles_fos2025 WHERE id = auth.uid())
    ) AND
    (get_my_role() IN ('admin', 'manager'))
  );

-- 3. UPDATE Policy: Any authenticated user in the company can update tasks (e.g., to change status).
-- This is a business decision. If only managers should update, change the policy.
CREATE POLICY "Allow company members to update tasks" ON tasks_fos2025
  FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects_fos2025
      WHERE company_id = (SELECT company_id FROM public.profiles_fos2025 WHERE id = auth.uid())
    )
  );

-- 4. DELETE Policy: Only admins and managers can delete tasks.
CREATE POLICY "Allow admins and managers to delete tasks" ON tasks_fos2025
  FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects_fos2025
      WHERE company_id = (SELECT company_id FROM public.profiles_fos2025 WHERE id = auth.uid())
    ) AND
    (get_my_role() IN ('admin', 'manager'))
  );

-- ============================================================================
-- CLIENTS POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow company members to read clients" ON clients_fos2025;
DROP POLICY IF EXISTS "Allow company members to insert clients" ON clients_fos2025;
DROP POLICY IF EXISTS "Allow company members to update clients" ON clients_fos2025;
DROP POLICY IF EXISTS "Allow company members to delete clients" ON clients_fos2025;

-- 1. SELECT (read) Policy: Any authenticated user in the company can read clients.
CREATE POLICY "Allow company members to read clients" ON clients_fos2025
  FOR SELECT
  TO authenticated
  USING (company_id = (SELECT company_id FROM public.profiles_fos2025 WHERE id = auth.uid()));

-- 2. INSERT (create) Policy: Only admins and managers can create clients.
CREATE POLICY "Allow admins and managers to insert clients" ON clients_fos2025
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles_fos2025 WHERE id = auth.uid()) AND
    (get_my_role() IN ('admin', 'manager'))
  );

-- 3. UPDATE Policy: Only admins and managers can update clients.
CREATE POLICY "Allow admins and managers to update clients" ON clients_fos2025
  FOR UPDATE
  TO authenticated
  USING (
    company_id = (SELECT company_id FROM public.profiles_fos2025 WHERE id = auth.uid()) AND
    (get_my_role() IN ('admin', 'manager'))
  );

-- 4. DELETE Policy: Only admins can delete clients.
CREATE POLICY "Allow admins to delete clients" ON clients_fos2025
  FOR DELETE
  TO authenticated
  USING (
    company_id = (SELECT company_id FROM public.profiles_fos2025 WHERE id = auth.uid()) AND
    (get_my_role() = 'admin')
  );
