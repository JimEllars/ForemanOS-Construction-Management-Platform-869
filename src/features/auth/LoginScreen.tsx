import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';

const { FiEye, FiEyeOff, FiInfo, FiAlertCircle } = FiIcons;

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
      await login(email.trim(), password);
      // ✅ Don't navigate here - let the useEffect handle it when isAuthenticated changes
      console.log('🔄 Login process completed, waiting for auth state update...');
    } catch (err) {
      // Error is handled in the store
      console.error('Login failed:', err);
    }
  };

  const getErrorIcon = () => {
    if (error?.includes('Invalid email or password')) {
      return FiAlertCircle;
    }
    return FiInfo;
  };

  const getErrorColor = () => {
    if (error?.includes('Invalid email or password')) {
      return 'danger';
    }
    return 'warning';
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
                  <SafeIcon icon={getErrorIcon()} className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{error}</p>
                    {error.includes('Invalid email or password') && (
                      <div className="mt-2 text-sm">
                        <p>Troubleshooting tips:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Double-check your email and password</li>
                          <li>Use "Forgot password?" if needed</li>
                          <li>Make sure your account is confirmed</li>
                        </ul>
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
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

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