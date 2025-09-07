import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('demo@foremanos.com');
  const [password, setPassword] = useState('demo123456');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@foremanos.com');
    setPassword('demo123456');
    setError('');
    setIsLoading(true);

    try {
      await login('demo@foremanos.com', 'demo123456');
      navigate('/app');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />

          {error && (
            <div className="text-sm text-danger-600 bg-danger-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-secondary-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-secondary-500">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            Try Demo Account
          </Button>

          <div className="text-center">
            <Link
              to="/auth/register"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </form>

        <div className="mt-6 p-4 bg-primary-50 rounded-lg">
          <h4 className="text-sm font-medium text-primary-900 mb-2">Demo Credentials:</h4>
          <p className="text-sm text-primary-700">
            <strong>Email:</strong> demo@foremanos.com<br />
            <strong>Password:</strong> demo123456
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginScreen;