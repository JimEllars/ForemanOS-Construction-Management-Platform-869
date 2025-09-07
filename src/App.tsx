import React, { useEffect } from 'react';
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
  const { 
    isAuthenticated, 
    isLoading, 
    setUser, 
    setCompany, 
    setSession, 
    setLoading, 
    setOnlineStatus, 
    clearError, 
    handleSuccessfulLogin 
  } = useStore();

  // Load data when authenticated
  useSupabaseData();

  useEffect(() => {
    // Clear any errors on app start
    clearError();

    // Check initial session
    const checkSession = async () => {
      try {
        console.log('🔍 Checking existing session...');
        setLoading(true);
        
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Session check error:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          console.log('✅ Found existing session for:', session.user.email);
          // Use the same handleSuccessfulLogin function from authSlice
          // This ensures consistency between login and session restoration
          try {
            await handleSuccessfulLogin({ user: session.user, session });
            console.log('✅ Session restored successfully');
          } catch (profileError) {
            console.error('❌ Failed to restore session profile:', profileError);
            // Clear the session if profile loading fails
            await supabase.auth.signOut();
            setLoading(false);
          }
        } else {
          console.log('ℹ️ No existing session found');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Session check error:', error);
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in:', session.user.email);
          try {
            await handleSuccessfulLogin({ user: session.user, session });
          } catch (error) {
            console.error('❌ Failed to handle sign in:', error);
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setUser(null);
          setCompany(null);
          setSession(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed');
          setSession(session);
        }
      }
    );

    // Listen for online/offline status
    const handleOnline = () => {
      console.log('🌐 Back online');
      setOnlineStatus(true);
    };

    const handleOffline = () => {
      console.log('📴 Gone offline');
      setOnlineStatus(false);
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
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setUser, setCompany, setSession, setLoading, setOnlineStatus, clearError, handleSuccessfulLogin]);

  // Enhanced loading screen with sequential progress
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 font-medium">Loading ForemanOS...</p>
          <p className="text-secondary-500 text-sm mt-1">Initializing your workspace</p>
          
          {/* Enhanced Progress steps */}
          <div className="mt-4 bg-white rounded-lg p-4 shadow-sm border border-secondary-200 max-w-sm mx-auto">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-secondary-600">Authenticating...</span>
                <div className="w-3 h-3 border border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-500">Loading profile...</span>
                <div className="w-3 h-3 border border-secondary-200 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-500">Preparing data...</span>
                <div className="w-3 h-3 border border-secondary-200 rounded-full"></div>
              </div>
              <div className="pt-2 border-t border-secondary-100">
                <div className="text-secondary-400 text-center">
                  Sequential loading prevents race conditions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            element={isAuthenticated ? <AppLayout /> : <Navigate to="/auth/login" replace />}
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
            element={<Navigate to={isAuthenticated ? "/app" : "/auth/login"} replace />} 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;