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
  // ✅ FIXED: Separate state for initial session check
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  
  const { 
    isAuthenticated, 
    isLoading, 
    setUser, 
    setCompany, 
    setSession, 
    setOnlineStatus, 
    clearError, 
    handleSuccessfulLogin 
  } = useStore();

  // Load data when authenticated
  useSupabaseData();

  useEffect(() => {
    let mounted = true; // Prevent state updates if component unmounts
    let timeoutId: NodeJS.Timeout;

    // Clear any errors on app start
    clearError();
    setInitializationError(null);

    // ✅ BULLETPROOF: Set a maximum timeout for initialization
    const initTimeout = setTimeout(() => {
      if (mounted && isCheckingSession) {
        console.warn('⚠️ Session check taking too long, proceeding anyway...');
        setIsCheckingSession(false);
        setInitializationError('Session check timed out, but you can still proceed.');
      }
    }, 10000); // 10 second maximum wait

    // Check initial session
    const checkSession = async () => {
      try {
        console.log('🔍 Checking existing session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return; // Component was unmounted

        if (error) {
          console.error('❌ Session check error:', error);
          // Don't treat session errors as fatal - user can still log in
          setInitializationError(`Session check failed: ${error.message}`);
          return;
        }

        if (session?.user) {
          console.log('✅ Found existing session for:', session.user.email);
          // The onAuthStateChange listener will handle this automatically
          // No need to call handleSuccessfulLogin here to avoid duplicate calls
        } else {
          console.log('ℹ️ No existing session found - user needs to log in');
        }
      } catch (error) {
        console.error('❌ Session check error:', error);
        if (mounted) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setInitializationError(`Failed to check session: ${errorMessage}`);
        }
      } finally {
        // ✅ CRITICAL FIX: Always clear the initial loading state
        if (mounted) {
          clearTimeout(initTimeout);
          setIsCheckingSession(false);
          console.log('✅ Initial session check completed');
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔄 Auth state changed:', event, session?.user?.email);

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in:', session.user.email);
          try {
            await handleSuccessfulLogin({ user: session.user, session });
          } catch (error) {
            console.error('❌ Failed to handle sign in:', error);
            // Don't prevent app from working if profile loading fails
            if (mounted) {
              setInitializationError('Profile loading failed, but authentication succeeded.');
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          if (mounted) {
            setUser(null);
            setCompany(null);
            setSession(null);
            setInitializationError(null);
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
  }, []); // ✅ SIMPLIFIED: Empty dependency array

  // ✅ FIXED: Show initial loading screen only during session check
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600 font-medium">Initializing ForemanOS...</p>
          <p className="text-secondary-500 text-sm mt-1">Checking for existing session</p>
          
          {/* Progress indicator */}
          <div className="mt-4 w-full bg-secondary-200 rounded-full h-2">
            <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          
          {/* Helpful message */}
          <p className="text-xs text-secondary-400 mt-3">
            This should only take a moment...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Show initialization error if it occurred, but still allow app to function
  const showInitError = initializationError && !isAuthenticated;

  // ✅ FIXED: Now the auth slice's isLoading only controls loading during explicit actions
  // The main app routing will work correctly once isCheckingSession is false

  return (
    <ErrorBoundary>
      <Router>
        {/* Show initialization error banner if needed */}
        {showInitError && (
          <div className="bg-warning-50 border-b border-warning-200 p-3 text-center">
            <div className="flex items-center justify-center space-x-2 text-warning-700">
              <span className="text-sm">⚠️ {initializationError}</span>
              <button 
                onClick={() => setInitializationError(null)}
                className="text-warning-600 hover:text-warning-800 ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        )}

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