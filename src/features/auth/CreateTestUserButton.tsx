import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { fixAuthenticationIssues, checkSupabaseEmailSettings, confirmExistingDemoUser } from '../../utils/authFixer';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';

const { FiUser, FiCheck, FiAlertCircle, FiRefreshCw, FiSettings, FiInfo, FiCheckCircle } = FiIcons;

const CreateTestUserButton: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isCheckingSettings, setIsCheckingSettings] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    credentials?: {
      email: string;
      password: string;
    };
    userConfirmed?: boolean;
    needsManualConfirmation?: boolean;
  } | null>(null);
  const [emailSettings, setEmailSettings] = useState<{
    emailConfirmationEnabled: boolean;
    canDisable: boolean;
    instructions: string[];
  } | null>(null);

  const handleCreateTestUser = async () => {
    setIsCreating(true);
    setResult(null);

    try {
      console.log('🔧 Starting comprehensive authentication fix...');
      const fixResult = await fixAuthenticationIssues();
      setResult(fixResult);

      if (fixResult.success && fixResult.userConfirmed) {
        console.log('✅ Test user is ready for login');
      } else if (fixResult.needsManualConfirmation) {
        console.log('⚠️ Manual confirmation required');
        // Check email settings to provide better guidance
        const settings = await checkSupabaseEmailSettings();
        setEmailSettings(settings);
      }

    } catch (error: any) {
      console.error('❌ Failed to fix authentication:', error);
      setResult({
        success: false,
        message: `Authentication fix failed: ${error.message}. Please check your Supabase connection and database setup.`
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleConfirmExistingUser = async () => {
    setIsConfirming(true);
    setResult(null);

    try {
      console.log('🔧 Attempting to confirm existing demo user...');
      const confirmResult = await confirmExistingDemoUser();
      setResult(confirmResult);

      if (confirmResult.success && confirmResult.userConfirmed) {
        console.log('✅ Demo user confirmed and ready');
      }

    } catch (error: any) {
      console.error('❌ Failed to confirm user:', error);
      setResult({
        success: false,
        message: `User confirmation failed: ${error.message}`
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCheckEmailSettings = async () => {
    setIsCheckingSettings(true);
    try {
      const settings = await checkSupabaseEmailSettings();
      setEmailSettings(settings);
    } catch (error) {
      console.error('Failed to check email settings:', error);
    } finally {
      setIsCheckingSettings(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-primary-800 mb-2">
          Authentication Fix & Test Account
        </h3>
        <p className="text-xs text-primary-700 mb-3">
          This tool will diagnose and fix authentication issues, then create or verify a working test account.
        </p>
        
        <div className="space-y-3">
          {/* Quick fix for existing demo user */}
          <Button
            onClick={handleConfirmExistingUser}
            disabled={isConfirming}
            size="sm"
            className="w-full"
            variant="success"
          >
            {isConfirming ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Confirming Demo User...
              </>
            ) : (
              <>
                <SafeIcon icon={FiCheckCircle} className="w-4 h-4 mr-2" />
                Fix Demo User (Quick Solution)
              </>
            )}
          </Button>

          <Button
            onClick={handleCreateTestUser}
            disabled={isCreating}
            size="sm"
            className="w-full"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Fixing Authentication...
              </>
            ) : (
              <>
                <SafeIcon icon={FiRefreshCw} className="w-4 h-4 mr-2" />
                Create New Test Account
              </>
            )}
          </Button>

          {!result && (
            <Button
              onClick={handleCheckEmailSettings}
              disabled={isCheckingSettings}
              size="sm"
              variant="outline"
              className="w-full"
            >
              {isCheckingSettings ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                  Checking Settings...
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSettings} className="w-4 h-4 mr-2" />
                  Check Email Confirmation Settings
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Email Settings Check Result */}
      {emailSettings && (
        <div className="bg-info-50 border border-info-200 rounded-lg p-4">
          <div className="flex items-start">
            <SafeIcon icon={FiInfo} className="w-5 h-5 text-info-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-info-800 mb-2">
                Email Confirmation Settings
              </p>
              <div className="text-xs text-info-700 space-y-2">
                <p>
                  <strong>Status:</strong> Email confirmation is {emailSettings.emailConfirmationEnabled ? 'ENABLED' : 'DISABLED'}
                </p>
                <div>
                  <p className="font-medium mb-1">Instructions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {emailSettings.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Result */}
      {result && (
        <div className={`border rounded-lg p-4 ${
          result.success 
            ? 'bg-success-50 border-success-200' 
            : 'bg-danger-50 border-danger-200'
        }`}>
          <div className="flex items-start">
            <SafeIcon 
              icon={result.success ? FiCheck : FiAlertCircle} 
              className={`w-5 h-5 mr-2 mt-0.5 flex-shrink-0 ${
                result.success ? 'text-success-600' : 'text-danger-600'
              }`} 
            />
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                result.success ? 'text-success-800' : 'text-danger-800'
              }`}>
                {result.message}
              </p>
              
              {/* Login Credentials */}
              {result.credentials && (
                <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border">
                  <p className="text-xs font-medium mb-2">
                    {result.userConfirmed ? 'Ready to Login:' : 'Test Account Credentials:'}
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <code className="bg-white px-1 rounded">{result.credentials.email}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Password:</span>
                      <code className="bg-white px-1 rounded">{result.credentials.password}</code>
                    </div>
                  </div>
                  
                  {result.userConfirmed ? (
                    <div className="mt-2 p-2 bg-success-100 rounded text-xs text-success-700">
                      ✅ <strong>Ready!</strong> You can now use these credentials to log in immediately.
                    </div>
                  ) : (
                    <div className="mt-2 p-2 bg-warning-100 rounded text-xs text-warning-700">
                      ⚠️ <strong>Confirmation Required:</strong> Email confirmation is still required for this account.
                    </div>
                  )}
                </div>
              )}

              {/* Manual Confirmation Instructions */}
              {result.needsManualConfirmation && (
                <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border">
                  <p className="text-xs font-medium mb-2">To Enable Login:</p>
                  <div className="text-xs space-y-2">
                    <div>
                      <p className="font-medium">Option 1: Disable Email Confirmation (Recommended for Development)</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 ml-2">
                        <li>Go to Supabase Dashboard → Authentication → Settings</li>
                        <li>Find "Enable email confirmations" and turn it OFF</li>
                        <li>Save settings and try logging in again</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">Option 2: Manually Confirm User</p>
                      <ul className="list-disc list-inside mt-1 space-y-1 ml-2">
                        <li>Go to Supabase Dashboard → Authentication → Users</li>
                        <li>Find the user email and click "Confirm User"</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Help for Errors */}
              {!result.success && (
                <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border">
                  <p className="text-xs font-medium mb-2">Troubleshooting:</p>
                  <ul className="text-xs space-y-1">
                    <li>• Check your Supabase project connection</li>
                    <li>• Verify database tables exist (companies_fos2025, profiles_fos2025, etc.)</li>
                    <li>• Ensure RLS policies allow user registration</li>
                    <li>• Check browser console for detailed error logs</li>
                    <li>• Try refreshing the page and running the fix again</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Help */}
      <div className="text-xs text-secondary-500 text-center">
        <p>
          <strong>Quick Fix:</strong> Click "Fix Demo User" to automatically resolve email confirmation issues.
          This handles the existing demo@foremanos.com account and creates working credentials.
        </p>
      </div>
    </div>
  );
};

export default CreateTestUserButton;