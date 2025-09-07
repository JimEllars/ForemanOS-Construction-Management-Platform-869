import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';

const { FiArrowLeft, FiMail, FiCheck } = FiIcons;

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword, isLoading, error, clearError } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email.trim()) {
      return;
    }

    try {
      await resetPassword(email.trim());
      setEmailSent(true);
    } catch (err) {
      // Error is handled in the store
    }
  };

  if (emailSent) {
    return (
      <Card>
        <CardHeader>
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-100 mb-4">
              <SafeIcon icon={FiCheck} className="h-6 w-6 text-success-600" />
            </div>
            <CardTitle>Check Your Email</CardTitle>
            <p className="text-sm text-secondary-600 mt-2">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-start">
                <SafeIcon icon={FiMail} className="w-5 h-5 text-primary-600 mt-0.5 mr-3" />
                <div className="text-sm text-primary-700">
                  <p className="font-medium mb-1">Next Steps:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Check your email inbox and spam folder</li>
                    <li>Click the reset link in the email</li>
                    <li>Create a new strong password</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              variant="outline"
              className="w-full"
            >
              Send Another Email
            </Button>

            <div className="text-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
              >
                <SafeIcon icon={FiArrowLeft} className="w-4 h-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Reset Your Password</CardTitle>
        <p className="text-sm text-secondary-600 text-center">
          Enter your email address and we'll send you a link to reset your password.
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

          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <div className="text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
            >
              <SafeIcon icon={FiArrowLeft} className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ForgotPasswordScreen;