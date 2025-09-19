-- Enum type for expense categories
CREATE TYPE expense_category AS ENUM (
    'materials',
    'labor',
    'subcontractor',
    'equipment_rental',
    'permits_fees',
    'fuel',
    'other'
);

-- Expenses Table
-- Stores all project-related expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies_fos2025(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects_fos2025(id) ON DELETE CASCADE,
  category expense_category NOT NULL,
  description TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT, -- URL to the receipt in Supabase Storage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for Expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for user's own company"
ON expenses FOR ALL
USING (company_id IN (
  SELECT company_id FROM profiles_fos2025 WHERE user_id = auth.uid()
));
