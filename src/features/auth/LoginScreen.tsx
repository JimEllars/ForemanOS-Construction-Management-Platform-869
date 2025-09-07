import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';

const { FiEye, FiEyeOff, FiInfo, FiRefreshCw } = FiIcons;

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('demo@foremanos.com');
  const [password, setPassword] = useState('demo123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);
  const { login, isLoading, error, clearError, createDemoUser } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Get any success message from registration
  const registrationMessage = location.state?.message;

  useEffect(() => {
    // Clear any previous errors when component mounts
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return;
    }

    try {
      await login(email.trim(), password);
      navigate('/app');
    } catch (err) {
      // Error is handled in the store
      console.error('Login failed:', err);
    }
  };

  const handleDemoLogin = async () => {
    try {
      await login('demo@foremanos.com', 'demo123456');
      navigate('/app');
    } catch (err) {
      console.error('Demo login failed:', err);
    }
  };

  const handleSetupDemo = async () => {
    try {
      setIsCreatingDemo(true);
      await createDemoUser();
      // Small delay to let the user be created
      setTimeout(() => {
        handleDemoLogin();
      }, 1000);
    } catch (err) {
      console.error('Demo setup failed:', err);
    } finally {
      setIsCreatingDemo(false);
    }
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
              <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SafeIcon icon={FiInfo} className="w-5 h-5 mr-2" />
                    <span>{error}</span>
                  </div>
                  {error.includes('Demo user') && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleSetupDemo}
                      disabled={isCreatingDemo}
                      className="ml-2"
                    >
                      <SafeIcon 
                        icon={FiRefreshCw} 
                        className={`w-3 h-3 mr-1 ${isCreatingDemo ? 'animate-spin' : ''}`}
                      />
                      Setup Demo
                    </Button>
                  )}
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-secondary-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-secondary-500">Quick Access</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                Try Demo Account
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={handleSetupDemo}
                disabled={isCreatingDemo || isLoading}
              >
                <SafeIcon 
                  icon={FiRefreshCw} 
                  className={`w-4 h-4 mr-2 ${isCreatingDemo ? 'animate-spin' : ''}`}
                />
                {isCreatingDemo ? 'Setting up Demo...' : 'Setup Demo Account'}
              </Button>
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

          <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <h4 className="text-sm font-medium text-primary-900 mb-2">Demo Credentials:</h4>
            <div className="text-sm text-primary-700 space-y-1">
              <p><strong>Email:</strong> demo@foremanos.com</p>
              <p><strong>Password:</strong> demo123456</p>
            </div>
            <p className="text-xs text-primary-600 mt-2">
              Click "Setup Demo Account" if login fails
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;