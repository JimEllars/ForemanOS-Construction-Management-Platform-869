# Database Fix Instructions

## Execute these scripts in your Supabase SQL Editor in this exact order:

### Step 1: Clean up problematic functions
1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the entire contents of `database-cleanup-step1.sql`
4. Click "Run" to execute
5. Verify the cleanup was successful

### Step 2: Fix RLS policies
1. In the same SQL Editor
2. Copy and paste the entire contents of `database-cleanup-step2.sql`  
3. Click "Run" to execute
4. Verify all policies were created successfully

### Expected Results:
- All old, problematic functions and triggers will be removed
- All existing RLS policies will be dropped and recreated with simple, non-recursive logic
- Registration and login should work without infinite recursion errors

### Test After Running:
1. Try registering a new account
2. Try logging in with existing credentials
3. Both should work without database errors

### If Issues Persist:
- Check the Supabase logs for any remaining error messages
- Ensure both scripts ran completely without errors
- Contact support if you see any remaining "infinite recursion" errors