-- Create a table to link users to companies and assign roles
CREATE TABLE IF NOT EXISTS company_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies_fos2025(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'worker')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, user_id)
);

-- Create a table for pending invitations
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies_fos2025(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'worker')),
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',

  UNIQUE(company_id, email)
);

-- Add RLS policies for the new tables
ALTER TABLE company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Admins and managers can see all users in their company
CREATE POLICY "Allow admin/manager to view company users"
ON company_users FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM company_users WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'manager')
  )
);

-- Users can see their own company_user record
CREATE POLICY "Allow user to see their own record"
ON company_users FOR SELECT
USING (user_id = auth.uid());

-- Admins and managers can manage users in their company
CREATE POLICY "Allow admin/manager to manage company users"
ON company_users FOR ALL
USING (
  company_id IN (
    SELECT company_id FROM company_users WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'manager')
  )
);

-- Admins and managers can manage invitations
CREATE POLICY "Allow admin/manager to manage invitations"
ON invitations FOR ALL
USING (
  company_id IN (
    SELECT company_id FROM company_users WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'manager')
  )
);
