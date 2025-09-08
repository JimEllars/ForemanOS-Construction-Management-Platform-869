-- STEP 1: Create the test company first
INSERT INTO companies_fos2025 (name, plan, created_at, updated_at)
VALUES (
  'Demo Construction Co',
  'pro',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING
RETURNING id;

-- Note: We'll need the company ID from above for the next step
-- Replace 'COMPANY_ID_HERE' with the actual ID returned

-- STEP 2: After creating the company, we need to register the user through the auth system
-- This cannot be done via SQL - it must be done through Supabase Auth

-- STEP 3: Create sample data for the demo company
-- (This will be populated after we get the company ID)