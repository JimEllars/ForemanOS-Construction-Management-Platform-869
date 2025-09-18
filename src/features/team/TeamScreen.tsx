import React, { useState, useEffect, useCallback } from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../components/common/SafeIcon';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { teamService } from '../../services/teamService';

const { FiUsers, FiPlus, FiSend, FiClock, FiChevronRight, FiAlertCircle } = FiIcons;

const TeamScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('worker');
  const [isInviting, setIsInviting] = useState(false);

  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [users, invites] = await Promise.all([
        teamService.getCompanyUsers(),
        teamService.getPendingInvitations(),
      ]);
      setTeamMembers(users);
      setPendingInvitations(invites);
    } catch (err) {
      setError('Failed to load team data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsInviting(true);
    try {
      const result = await teamService.inviteUser(email, role);
      console.log('Invitation result:', result);
      // Here you would typically show a success toast message
      setEmail('');
      setRole('worker');
      // Refresh data after sending invitation
      fetchTeamData();
    } catch (error) {
      console.error('Failed to send invitation:', error);
      // Here you would show an error toast message
    } finally {
      setIsInviting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading team data..." />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <SafeIcon icon={FiAlertCircle} className="w-12 h-12 mx-auto text-red-500" />
        <h3 className="mt-2 text-lg font-medium text-red-600">Error</h3>
        <p className="mt-1 text-secondary-500">{error}</p>
        <Button onClick={fetchTeamData} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">Team Management</h1>
        <p className="text-secondary-600 dark:text-secondary-400 mt-1">Invite and manage your team members.</p>
      </div>

      {/* Invite Member Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SafeIcon icon={FiPlus} className="w-5 h-5 mr-3 text-primary-600" />
            Invite a New Team Member
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-full">
              <label htmlFor="email" className="sr-only">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="new.member@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="w-full md:w-auto">
              <label htmlFor="role" className="sr-only">Role</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full md:w-auto form-select block pl-3 pr-10 py-2 text-base border-secondary-300 dark:border-secondary-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
              >
                <option value="worker">Worker</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" className="w-full md:w-auto" disabled={isInviting}>
              {isInviting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <SafeIcon icon={FiSend} className="w-4 h-4 mr-2" />
                  Send Invitation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SafeIcon icon={FiUsers} className="w-5 h-5 mr-3 text-primary-600" />
              Current Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teamMembers.length > 0 ? (
              <ul className="divide-y divide-secondary-200 dark:divide-secondary-700">
                {teamMembers.map(member => (
                  <li key={member.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-secondary-900 dark:text-secondary-100">{member.name}</p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">{member.email}</p>
                    </div>
                    <span className="text-sm capitalize px-2 py-1 rounded-full bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300">{member.role}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-secondary-500 py-4">No team members yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SafeIcon icon={FiClock} className="w-5 h-5 mr-3 text-primary-600" />
              Pending Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingInvitations.length > 0 ? (
              <ul className="divide-y divide-secondary-200 dark:divide-secondary-700">
                {pendingInvitations.map(invitation => (
                  <li key={invitation.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-secondary-900 dark:text-secondary-100">{invitation.email}</p>
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">Role: {invitation.role}</p>
                    </div>
                    <span className="text-sm capitalize px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">{invitation.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-secondary-500 py-4">No pending invitations.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamScreen;
