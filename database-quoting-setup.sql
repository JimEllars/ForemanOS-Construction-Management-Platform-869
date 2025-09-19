-- Enum type for quote status
CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected', 'invoiced');

-- Quotes Table
-- Stores the main information for each quote
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies_fos2025(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects_fos2025(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES clients_fos2025(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL,
  status quote_status NOT NULL DEFAULT 'draft',
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, quote_number)
);

-- Quote Line Items Table
-- Stores individual items associated with a quote
CREATE TABLE IF NOT EXISTS quote_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for Quotes
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for user's own company"
ON quotes FOR ALL
USING (company_id IN (
  SELECT company_id FROM profiles_fos2025 WHERE user_id = auth.uid()
));

-- RLS Policies for Quote Line Items
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for user's own company"
ON quote_line_items FOR ALL
USING (quote_id IN (
  SELECT id FROM quotes WHERE company_id IN (
    SELECT company_id FROM profiles_fos2025 WHERE user_id = auth.uid()
  )
));
