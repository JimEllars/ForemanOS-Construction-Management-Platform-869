import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';

const { FiEye, FiEyeOff, FiInfo, FiAlertCircle, FiWifi } = FiIcons;

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, isLoading, error, clearError, isAuthenticated } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Get any success message from registration
  const registrationMessage = location.state?.message;

  useEffect(() => {
    // Clear any previous errors when component mounts
    clearError();
  }, [clearError]);

  // ✅ CRITICAL FIX: Navigate when authentication succeeds
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ User authenticated, navigating to dashboard...');
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return;
    }

    try {
      console.log('🔑 Starting login process...');
      
      // Clear any previous errors
      clearError();
      
      await login(email.trim(), password);
      
      console.log('🎉 Login completed successfully - user should be redirected');
      
    } catch (err) {
      // Error is handled in the store
      console.error('❌ Login failed:', err);
    }
  };

  const getErrorIcon = () => {
    if (error?.includes('Invalid email or password')) {
      return FiAlertCircle;
    }
    if (error?.includes('Database error') || error?.includes('contact support')) {
      return FiAlertCircle;
    }
    return FiInfo;
  };

  const getErrorColor = () => {
    if (error?.includes('Invalid email or password')) {
      return 'danger';
    }
    if (error?.includes('Database error') || error?.includes('contact support')) {
      return 'danger';
    }
    return 'warning';
  };

  const getErrorSuggestions = () => {
    if (error?.includes('Invalid email or password')) {
      return [
        'Double-check your email and password',
        'Use "Forgot password?" if needed',
        'Make sure your account is confirmed'
      ];
    }
    if (error?.includes('Database error') || error?.includes('contact support')) {
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Wait a moment and try again',
        'Contact support if the issue persists'
      ];
    }
    if (error?.includes('Too many requests')) {
      return [
        'Wait 5-10 minutes before trying again',
        'Clear your browser cache',
        'Try using a different browser'
      ];
    }
    return [];
  };

  return (
    <div className="space-y-6">
      {registrationMessage && (
        <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <SafeIcon icon={FiInfo} className="w-5 h-5 mr-2" />
            {registrationMessage}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Sign In to ForemanOS</CardTitle>
          <p className="text-sm text-secondary-600 text-center">
            Welcome back! Please sign in to your account.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
              autoComplete="email"
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-secondary-700">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <SafeIcon
                    icon={showPassword ? FiEyeOff : FiEye}
                    className="w-4 h-4 text-secondary-400 hover:text-secondary-600"
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-700">
                  Remember me
                </label>
              </div>

              <Link
                to="/auth/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className={`bg-${getErrorColor()}-50 border border-${getErrorColor()}-200 text-${getErrorColor()}-700 px-4 py-3 rounded-md`}>
                <div className="flex items-start">
                  <SafeIcon
                    icon={getErrorIcon()}
                    className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{error}</p>
                    
                    {getErrorSuggestions().length > 0 && (
                      <div className="mt-2 text-sm">
                        <p>Troubleshooting tips:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {getErrorSuggestions().map((suggestion, index) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(error?.includes('Database error') || error?.includes('contact support')) && (
                      <div className="mt-3 p-2 bg-white bg-opacity-50 rounded border">
                        <p className="text-xs font-medium">Need immediate help?</p>
                        <p className="text-xs">
                          Try creating a new account or contact support with this error message.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email.trim() || !password.trim()}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Connection status indicator */}
            <div className="flex items-center justify-center space-x-2 text-xs text-secondary-500">
              <SafeIcon icon={FiWifi} className="w-3 h-3" />
              <span>Connected to ForemanOS</span>
            </div>

            <div className="text-center">
              <Link
                to="/auth/register"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Don't have an account? <span className="font-medium">Sign up</span>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;