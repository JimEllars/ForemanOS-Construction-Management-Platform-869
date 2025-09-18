import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TeamScreen from './TeamScreen';
import { teamService } from '../../services/teamService';

// Mock the teamService
vi.mock('../../services/teamService', () => ({
  teamService: {
    getCompanyUsers: vi.fn(),
    getPendingInvitations: vi.fn(),
    inviteUser: vi.fn(),
  },
}));

const mockTeamMembers = [
  { id: '1', name: 'Jules', email: 'jules@example.com', role: 'admin' },
];
const mockPendingInvitations = [
  { id: '2', email: 'greta@example.com', role: 'worker', status: 'pending', expires_at: new Date(Date.now() + 86400000).toISOString() },
];

describe('TeamScreen', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  it('renders loading state initially', () => {
    // Mock the service to be in a pending state
    teamService.getCompanyUsers.mockReturnValue(new Promise(() => {}));
    teamService.getPendingInvitations.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter>
        <TeamScreen />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading team data...')).toBeInTheDocument();
  });

  it('renders team members and invitations after successful fetch', async () => {
    teamService.getCompanyUsers.mockResolvedValue(mockTeamMembers);
    teamService.getPendingInvitations.mockResolvedValue(mockPendingInvitations);

    render(
      <MemoryRouter>
        <TeamScreen />
      </MemoryRouter>
    );

    // Wait for the loading to complete and the component to re-render
    await waitFor(() => {
      expect(screen.getByText('Jules')).toBeInTheDocument();
    });

    expect(screen.getByText('greta@example.com')).toBeInTheDocument();
    expect(screen.getByText('Current Team')).toBeInTheDocument();
    expect(screen.getByText('Pending Invitations')).toBeInTheDocument();
  });

  it('renders an error message if fetching fails', async () => {
    teamService.getCompanyUsers.mockRejectedValue(new Error('API Error'));
    teamService.getPendingInvitations.mockResolvedValue([]); // Let this one succeed for simplicity

    render(
      <MemoryRouter>
        <TeamScreen />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load team data. Please try again.')).toBeInTheDocument();
    });
  });
});
