-- ============================================================================
-- FOREMANOS DATABASE FUNCTION CLEANUP
-- This script identifies and removes problematic functions/triggers
-- ============================================================================

-- STEP 1: Find all functions that might reference companies_fos2025
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%companies_fos2025%'
   OR p.proname ILIKE '%handle_new_user%'
   OR p.proname ILIKE '%create_profile%'
ORDER BY n.nspname, p.proname;

-- STEP 2: Find all triggers on auth.users table
SELECT 
    t.tgname as trigger_name,
    c.relname as table_name,
    n.nspname as schema_name,
    p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN pg_proc p ON t.tgfoid = p.oid
WHERE n.nspname = 'auth' AND c.relname = 'users'
ORDER BY t.tgname;

-- STEP 3: Remove problematic functions and triggers
-- Drop any triggers that might be causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users CASCADE;

-- Drop any functions that reference the old table name
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_profile_for_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_signup() CASCADE;

-- STEP 4: Verify cleanup
SELECT 'Cleanup completed successfully' as status;

-- STEP 5: Check if there are any remaining references to companies_fos2025 in functions
SELECT 
    'Remaining functions with companies_fos2025 reference:' as check_type,
    COUNT(*) as count
FROM pg_proc p
WHERE pg_get_functiondef(p.oid) ILIKE '%companies_fos2025%';