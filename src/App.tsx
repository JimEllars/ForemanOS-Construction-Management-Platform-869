import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { supabase } from './lib/supabaseClient';
import { useSupabaseData } from './hooks/useSupabaseData';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';

// Auth Screens
import LoginScreen from './features/auth/LoginScreen';
import RegisterScreen from './features/auth/RegisterScreen';
import ForgotPasswordScreen from './features/auth/ForgotPasswordScreen';

// App Screens
import DashboardScreen from './features/dashboard/DashboardScreen';
import ProjectsScreen from './features/projects/ProjectsScreen';
import ClientsScreen from './features/clients/ClientsScreen';

// Placeholder screens
const TasksScreen = () => <div className="p-6">Tasks Screen - Coming Soon</div>;
const DailyLogsScreen = () => <div className="p-6">Daily Logs Screen - Coming Soon</div>;
const TimeTrackingScreen = () => <div className="p-6">Time Tracking Screen - Coming Soon</div>;
const DocumentsScreen = () => <div className="p-6">Documents Screen - Coming Soon</div>;

function App() {
  // ✅ AUTHENTICATION ENABLED: Set to false to use real authentication
  const BYPASS_AUTH = false; // Real authentication enabled
  
  // ✅ SIMPLIFIED: Only track initial session check
  const [isCheckingSession, setIsCheckingSession] = useState(!BYPASS_AUTH);
  const { 
    isAuthenticated, 
    setUser, 
    setCompany, 
    setSession, 
    setOnlineStatus, 
    clearError,
    handleSuccessfulLogin 
  } = useStore();

  // Load supplementary data when authenticated
  useSupabaseData();

  useEffect(() => {
    if (BYPASS_AUTH) {
      // ✅ BYPASS: Set mock authentication data for testing
      console.log('🔓 BYPASS MODE: Setting mock authentication data...');
      
      // Create mock user and company data
      const mockUser = {
        id: 'mock-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin' as const,
        company_id: 'mock-company-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const mockCompany = {
        id: 'mock-company-id',
        name: 'Test Company',
        plan: 'pro' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Set mock data in store
      setUser(mockUser);
      setCompany(mockCompany);
      setSession({ user: mockUser });
      
      console.log('✅ BYPASS MODE: Mock authentication complete');
      return;
    }

    let mounted = true;
    let isHandlingAuth = false;

    // Clear any errors on app start
    clearError();

    // ✅ BULLETPROOF: Maximum 10 second timeout for session check
    const initTimeout = setTimeout(() => {
      if (mounted && isCheckingSession) {
        console.warn('⚠️ Session check timeout reached, proceeding to app...');
        setIsCheckingSession(false);
      }
    }, 10000);

    // Check initial session
    const checkSession = async () => {
      try {
        console.log('🔍 Checking for existing session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('❌ Session check error:', error);
          // Non-fatal - user can still log in
          setIsCheckingSession(false);
          return;
        }

        if (session?.user && !isHandlingAuth) {
          console.log('✅ Found existing session for:', session.user.email);
          isHandlingAuth = true;
          
          try {
            await handleSuccessfulLogin({
              user: session.user,
              session
            });
          } catch (error) {
            console.error('❌ Failed to handle existing session:', error);
          } finally {
            isHandlingAuth = false;
          }
        } else {
          console.log('ℹ️ No existing session found');
        }
      } catch (error) {
        console.error('❌ Session check failed:', error);
      } finally {
        if (mounted) {
          clearTimeout(initTimeout);
          setIsCheckingSession(false);
          console.log('✅ Session check completed');
        }
      }
    };

    checkSession();

    // ✅ SIMPLIFIED: Listen for auth changes but don't duplicate login handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        
        // ✅ CRITICAL FIX: Only handle SIGNED_OUT events here
        // Login is handled directly in the login function to prevent race conditions
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          if (mounted) {
            isHandlingAuth = false; // Reset the flag
            setUser(null);
            setCompany(null);
            setSession(null);
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed');
          if (mounted) {
            setSession(session);
          }
        }
      }
    );

    // Listen for online/offline status
    const handleOnline = () => {
      if (mounted) {
        console.log('🌐 Back online');
        setOnlineStatus(true);
      }
    };

    const handleOffline = () => {
      if (mounted) {
        console.log('📴 Gone offline');
        setOnlineStatus(false);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
        })
        .catch((registrationError) => {
          console.log('❌ Service Worker registration failed:', registrationError);
        });
    }

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ✅ IMPROVED: Better loading screen with timeout indication
  if (isCheckingSession && !BYPASS_AUTH) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 font-medium">Initializing ForemanOS...</p>
          <p className="text-secondary-500 text-sm mt-1">Checking authentication status</p>
          
          <div className="mt-4 w-full bg-secondary-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full animate-pulse" 
              style={{ width: '80%' }}
            ></div>
          </div>
          
          <p className="text-xs text-secondary-400 mt-3">
            This should complete within 10 seconds...
          </p>
          
          {/* ✅ FALLBACK: Show manual login option after timeout */}
          <div className="mt-6 p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <p className="text-xs text-primary-700">
              <strong>Taking too long?</strong> The app will automatically proceed to the login screen if initialization doesn't complete soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ BYPASS MODE: Always show app if bypass is enabled
  const shouldShowApp = BYPASS_AUTH || isAuthenticated;

  // ✅ CLEAN ROUTING: App renders immediately after session check
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginScreen />} />
            <Route path="register" element={<RegisterScreen />} />
            <Route path="forgot-password" element={<ForgotPasswordScreen />} />
          </Route>

          {/* App Routes */}
          <Route 
            path="/app" 
            element={shouldShowApp ? <AppLayout /> : <Navigate to="/auth/login" replace />}
          >
            <Route index element={<DashboardScreen />} />
            <Route path="projects" element={<ProjectsScreen />} />
            <Route path="tasks" element={<TasksScreen />} />
            <Route path="clients" element={<ClientsScreen />} />
            <Route path="daily-logs" element={<DailyLogsScreen />} />
            <Route path="time-tracking" element={<TimeTrackingScreen />} />
            <Route path="documents" element={<DocumentsScreen />} />
          </Route>

          {/* Default Redirects */}
          <Route 
            path="/" 
            element={<Navigate to={shouldShowApp ? "/app" : "/auth/login"} replace />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;