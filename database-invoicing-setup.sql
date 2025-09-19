-- Enum type for invoice status
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'void', 'overdue');

-- Invoices Table
-- Stores the main information for each invoice
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies_fos2025(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects_fos2025(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES clients_fos2025(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL, -- Link to the original quote
  invoice_number TEXT NOT NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, invoice_number)
);

-- Invoice Line Items Table
-- Stores individual items associated with an invoice
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for Invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for user's own company"
ON invoices FOR ALL
USING (company_id IN (
  SELECT company_id FROM profiles_fos2025 WHERE user_id = auth.uid()
));

-- RLS Policies for Invoice Line Items
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access for user's own company"
ON invoice_line_items FOR ALL
USING (invoice_id IN (
  SELECT id FROM invoices WHERE company_id IN (
    SELECT company_id FROM profiles_fos2025 WHERE user_id = auth.uid()
  )
));
