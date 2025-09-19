import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SafeIcon from '../../components/common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { teamService } from '../../services/teamService';

const { FiMail, FiAlertTriangle, FiCheckCircle } = FiIcons;

const AcceptInvitationScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<any | null>(null); // Replace 'any' with a proper type later

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided. Please use the link from your invitation email.');
      setIsLoading(false);
      return;
    }

    const validateToken = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await teamService.validateInvitationToken(token!);
        setInvitation(data);
      } catch (err: any) {
        setError(err.message || 'Failed to validate invitation. It may be invalid or expired.');
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleAccept = (action: 'login' | 'register') => {
    // Store the token to be used after authentication
    localStorage.setItem('pendingInvitationToken', token!);
    navigate(`/auth/${action}`);
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner size="lg" message="Validating your invitation..." />;
    }

    if (error) {
      return (
        <div className="text-center">
          <SafeIcon icon={FiAlertTriangle} className="w-12 h-12 mx-auto text-danger-500" />
          <h2 className="mt-4 text-xl font-bold text-danger-600">Invalid Invitation</h2>
          <p className="mt-2 text-secondary-600 dark:text-secondary-400">{error}</p>
          <Button asChild className="mt-6">
            <Link to="/auth/login">Go to Login</Link>
          </Button>
        </div>
      );
    }

    if (invitation) {
      return (
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full mx-auto flex items-center justify-center">
            <SafeIcon icon={FiMail} className="w-8 h-8 text-primary-600 dark:text-primary-300" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-secondary-900 dark:text-secondary-100">You're Invited!</h2>
          <p className="mt-2 text-lg text-secondary-600 dark:text-secondary-400">
            <strong>{invitation.invited_by_name}</strong> has invited you to join the team at <strong>{invitation.company_name}</strong> on ForemanOS.
          </p>
          <p className="mt-4 text-sm text-secondary-500">
            To accept this invitation, please sign up for a new account or log in to an existing one.
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="p-8">
        {renderContent()}
      </CardContent>
      {invitation && !error && (
        <CardFooter className="flex flex-col sm:flex-row gap-4 bg-secondary-50 dark:bg-secondary-800/50 p-6">
          <Button onClick={() => handleAccept('register')} className="w-full">
            <SafeIcon icon={FiCheckCircle} className="w-5 h-5 mr-2" />
            Create a New Account
          </Button>
          <Button onClick={() => handleAccept('login')} variant="outline" className="w-full">
            Log In to Existing Account
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default AcceptInvitationScreen;
