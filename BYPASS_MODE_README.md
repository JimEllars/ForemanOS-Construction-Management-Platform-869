# 🔓 BYPASS MODE - Temporary Authentication Disable

## What is Bypass Mode?

Bypass Mode temporarily disables authentication so you can view and test the ForemanOS application without needing to log in or deal with database authentication issues.

## Current Status: **ENABLED** ✅

Authentication is currently bypassed with mock data for testing purposes.

## What You Can Test:

### ✅ Available Features:
- **Dashboard** - View project overview with sample data
- **Projects Screen** - Browse mock construction projects
- **Clients Screen** - View sample client data
- **Navigation** - Full app navigation and UI
- **Responsive Design** - Test on different screen sizes
- **UI Components** - All buttons, modals, and interactions

### ⚠️ Limited Features:
- **Create/Edit Operations** - Won't persist to database
- **Real Data** - Using sample/mock data only
- **User Authentication** - Bypassed entirely

## Mock Data Includes:

### Projects (3 sample projects):
1. **Downtown Office Building** - In Progress ($250k)
2. **Residential Complex Phase 1** - Planning ($450k) 
3. **Highway Bridge Repair** - Completed ($180k)

### Tasks (4 sample tasks):
- Foundation Excavation (High Priority)
- Electrical Rough-in (Medium Priority)
- Site Survey (Completed)
- Permit Applications (High Priority)

### Clients (3 sample clients):
- Metro Development Corp
- Sunrise Residential  
- State Transportation Dept

## How to Re-enable Authentication:

1. Open `src/App.tsx`
2. Find line: `const BYPASS_AUTH = true;`
3. Change to: `const BYPASS_AUTH = false;`
4. Also update `src/hooks/useSupabaseData.ts` line: `const BYPASS_AUTH = true;` to `false`
5. Save files and refresh the browser

## Navigation:

- **Dashboard**: `/app` - Main overview screen
- **Projects**: `/app/projects` - Project management
- **Tasks**: `/app/tasks` - Task management (placeholder)
- **Clients**: `/app/clients` - Client management
- **Daily Logs**: `/app/daily-logs` - Daily logs (placeholder)
- **Time Tracking**: `/app/time-tracking` - Time tracking (placeholder)
- **Documents**: `/app/documents` - Document management (placeholder)

## Notes:

- All data changes are temporary and won't persist
- Perfect for UI/UX testing and demonstration
- No database connection required
- All authentication flows are skipped
- Mock user: "Test User" from "Test Company"

**Remember to re-enable authentication before production use!**