-- ============================================================================
-- DOCUMENTS TABLE AND STORAGE SETUP FOR FOREMANOS
-- This script creates the documents table and sets up Supabase Storage
-- ============================================================================

-- Step 1: Create documents table
CREATE TABLE IF NOT EXISTS documents_fos2025 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects_fos2025(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'pdf', 'document', 'spreadsheet', 'cad', 'archive', 'other')),
  file_extension TEXT,
  size_bytes BIGINT NOT NULL CHECK (size_bytes > 0),
  uploaded_by UUID NOT NULL REFERENCES profiles_fos2025(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents_fos2025(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents_fos2025(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents_fos2025(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents_fos2025(created_at DESC);

-- Step 3: Enable Row Level Security
ALTER TABLE documents_fos2025 ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for documents table
-- Users can only access documents from projects in their company

-- SELECT policy - users can view documents from their company's projects
CREATE POLICY "documents_select_by_company" ON documents_fos2025
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects_fos2025 p 
      JOIN profiles_fos2025 pr ON p.company_id = pr.company_id 
      WHERE pr.id = auth.uid()
    )
  );

-- INSERT policy - users can upload documents to their company's projects
CREATE POLICY "documents_insert_by_company" ON documents_fos2025
  FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT p.id 
      FROM projects_fos2025 p 
      JOIN profiles_fos2025 pr ON p.company_id = pr.company_id 
      WHERE pr.id = auth.uid()
    )
    AND uploaded_by = auth.uid()
  );

-- UPDATE policy - users can update documents they uploaded in their company
CREATE POLICY "documents_update_by_uploader" ON documents_fos2025
  FOR UPDATE TO authenticated
  USING (
    uploaded_by = auth.uid()
    AND project_id IN (
      SELECT p.id 
      FROM projects_fos2025 p 
      JOIN profiles_fos2025 pr ON p.company_id = pr.company_id 
      WHERE pr.id = auth.uid()
    )
  );

-- DELETE policy - users can delete documents they uploaded in their company
CREATE POLICY "documents_delete_by_uploader" ON documents_fos2025
  FOR DELETE TO authenticated
  USING (
    uploaded_by = auth.uid()
    AND project_id IN (
      SELECT p.id 
      FROM projects_fos2025 p 
      JOIN profiles_fos2025 pr ON p.company_id = pr.company_id 
      WHERE pr.id = auth.uid()
    )
  );

-- Step 5: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_updated_at_trigger
  BEFORE UPDATE ON documents_fos2025
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();

-- ============================================================================
-- STORAGE BUCKET SETUP (Run this in Supabase Dashboard SQL Editor)
-- ============================================================================

-- Note: Storage bucket creation must be done through Supabase Dashboard or CLI
-- Go to Storage > Create bucket > Name: "project-documents"

-- After creating the bucket, run these policies:

-- Storage policies for project-documents bucket
-- These need to be created in the Supabase Dashboard under Storage > project-documents > Policies

-- Policy 1: Allow authenticated users to upload files
-- Name: "Allow authenticated uploads"
-- Operation: INSERT
-- Policy: auth.role() = 'authenticated'

-- Policy 2: Allow users to view files from their company's projects
-- Name: "Allow company file access"  
-- Operation: SELECT
-- Policy: 
-- EXISTS (
--   SELECT 1 FROM documents_fos2025 d
--   JOIN projects_fos2025 p ON d.project_id = p.id
--   JOIN profiles_fos2025 pr ON p.company_id = pr.company_id
--   WHERE d.storage_path = storage.objects.name
--   AND pr.id = auth.uid()
-- )

-- Policy 3: Allow users to delete files they uploaded
-- Name: "Allow user file deletion"
-- Operation: DELETE  
-- Policy:
-- EXISTS (
--   SELECT 1 FROM documents_fos2025 d
--   WHERE d.storage_path = storage.objects.name
--   AND d.uploaded_by = auth.uid()
-- )

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'documents_fos2025' 
ORDER BY ordinal_position;

-- Verify indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'documents_fos2025';

-- Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'documents_fos2025'
ORDER BY policyname;

-- Test data insertion (replace with actual UUIDs from your data)
-- INSERT INTO documents_fos2025 (
--   project_id,
--   name,
--   storage_path,
--   file_type,
--   file_extension,
--   size_bytes,
--   uploaded_by
-- ) VALUES (
--   'your-project-id-here',
--   'test-document.pdf',
--   'project-id/timestamp-test-document.pdf',
--   'pdf',
--   'pdf',
--   1024000,
--   'your-user-id-here'
-- );

SELECT 'Documents table and policies created successfully!' as status;