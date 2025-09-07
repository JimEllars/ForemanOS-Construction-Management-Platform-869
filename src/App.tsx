import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { supabase } from './lib/supabaseClient';
import { useSupabaseData } from './hooks/useSupabaseData';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';

// Auth Screens
import LoginScreen from './features/auth/LoginScreen';
import RegisterScreen from './features/auth/RegisterScreen';

// App Screens
import DashboardScreen from './features/dashboard/DashboardScreen';
import ProjectsScreen from './features/projects/ProjectsScreen';

// Placeholder screens
const TasksScreen = () => <div className="p-6">Tasks Screen - Coming Soon</div>;
const ClientsScreen = () => <div className="p-6">Clients Screen - Coming Soon</div>;
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
    setOnlineStatus 
  } = useStore();

  // Load data when authenticated
  useSupabaseData();

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Fetch user profile and company
          const { data: profile, error } = await supabase
            .from('profiles_fos2025')
            .select(`
              *,
              companies_fos2025 (*)
            `)
            .eq('id', session.user.id)
            .single();

          if (!error && profile) {
            setUser(profile);
            setCompany(profile.companies_fos2025);
            setSession(session);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile, error } = await supabase
            .from('profiles_fos2025')
            .select(`
              *,
              companies_fos2025 (*)
            `)
            .eq('id', session.user.id)
            .single();

          if (!error && profile) {
            setUser(profile);
            setCompany(profile.companies_fos2025);
            setSession(session);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setCompany(null);
          setSession(null);
        }
      }
    );

    // Listen for online/offline status
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setUser, setCompany, setSession, setLoading, setOnlineStatus]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading ForemanOS...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginScreen />} />
          <Route path="register" element={<RegisterScreen />} />
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
  );
}

export default App;