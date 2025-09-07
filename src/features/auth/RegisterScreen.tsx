import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';

const { FiEye, FiEyeOff, FiCheck, FiX, FiInfo } = FiIcons;

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
  { label: 'One uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
  { label: 'One lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
  { label: 'One number', test: (pwd) => /\d/.test(pwd) },
  { label: 'One special character', test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd) },
];

const RegisterScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { register, isLoading, error, clearError } = useStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      return; // Error will be shown by the validation below
    }

    if (!acceptedTerms) {
      return;
    }

    const passwordValid = passwordRequirements.every(req => req.test(formData.password));
    if (!passwordValid) {
      return;
    }

    try {
      await register(
        formData.email.trim(),
        formData.password,
        formData.name.trim(),
        formData.companyName.trim()
      );
      navigate('/auth/login', {
        state: {
          message: 'Registration successful! You can now sign in with your credentials.'
        }
      });
    } catch (err) {
      // Error is handled in the store
    }
  };

  const passwordsMatch = formData.password && formData.confirmPassword && 
    formData.password === formData.confirmPassword;
  const passwordsDontMatch = formData.password && formData.confirmPassword && 
    formData.password !== formData.confirmPassword;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Create Your Account</CardTitle>
        <p className="text-sm text-secondary-600 text-center">
          Join ForemanOS and start managing your field operations efficiently.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              autoComplete="name"
            />

            <Input
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              placeholder="Enter your company name"
              autoComplete="organization"
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a strong password"
                autoComplete="new-password"
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
            
            {/* Password Requirements */}
            {formData.password && (
              <div className="mt-2 p-3 bg-secondary-50 rounded-md">
                <p className="text-xs font-medium text-secondary-700 mb-2">Password Requirements:</p>
                <div className="grid grid-cols-1 gap-1">
                  {passwordRequirements.map((req, index) => {
                    const isValid = req.test(formData.password);
                    return (
                      <div key={index} className="flex items-center text-xs">
                        <SafeIcon 
                          icon={isValid ? FiCheck : FiX} 
                          className={`w-3 h-3 mr-2 ${isValid ? 'text-success-600' : 'text-secondary-400'}`}
                        />
                        <span className={isValid ? 'text-success-700' : 'text-secondary-600'}>
                          {req.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-secondary-700">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <SafeIcon 
                  icon={showConfirmPassword ? FiEyeOff : FiEye} 
                  className="w-4 h-4 text-secondary-400 hover:text-secondary-600"
                />
              </button>
            </div>
            
            {/* Password Match Indicator */}
            {formData.confirmPassword && (
              <div className="flex items-center text-xs mt-1">
                <SafeIcon 
                  icon={passwordsMatch ? FiCheck : FiX} 
                  className={`w-3 h-3 mr-2 ${passwordsMatch ? 'text-success-600' : 'text-danger-600'}`}
                />
                <span className={passwordsMatch ? 'text-success-700' : 'text-danger-700'}>
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-start">
            <input
              id="accept-terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded mt-0.5"
            />
            <label htmlFor="accept-terms" className="ml-2 block text-sm text-secondary-700">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </Link>
            </label>
          </div>

          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md">
              <div className="flex items-center">
                <SafeIcon icon={FiInfo} className="w-5 h-5 mr-2" />
                {error}
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading || 
              !formData.name.trim() || 
              !formData.email.trim() || 
              !formData.companyName.trim() || 
              passwordsDontMatch ||
              !passwordRequirements.every(req => req.test(formData.password)) ||
              !acceptedTerms
            }
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <div className="text-center">
            <Link
              to="/auth/login"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Already have an account? <span className="font-medium">Sign in</span>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterScreen;