import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AcceptInvitationScreen from './AcceptInvitationScreen';
import { teamService } from '../../services/teamService';

// Mock the teamService
vi.mock('../../services/teamService');

describe('AcceptInvitationScreen', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock localStorage
    Storage.prototype.setItem = vi.fn();
  });

  it('displays an error message if no token is provided', () => {
    render(
      <MemoryRouter initialEntries={['/auth/accept-invitation']}>
        <Routes>
          <Route path="/auth/accept-invitation" element={<AcceptInvitationScreen />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText(/no invitation token provided/i)).toBeInTheDocument();
  });

  it('validates the token and displays invitation details on success', async () => {
    const mockInvitation = { invited_by_name: 'John Doe', company_name: 'Awesome Inc.' };
    vi.mocked(teamService.validateInvitationToken).mockResolvedValue(mockInvitation);

    render(
      <MemoryRouter initialEntries={['/auth/accept-invitation?token=test-token']}>
        <Routes>
          <Route path="/auth/accept-invitation" element={<AcceptInvitationScreen />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/you're invited/i)).toBeInTheDocument();
    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/awesome inc/i)).toBeInTheDocument();
  });

  it('displays an error message if token validation fails', async () => {
    vi.mocked(teamService.validateInvitationToken).mockRejectedValue(new Error('Invalid Token'));

    render(
      <MemoryRouter initialEntries={['/auth/accept-invitation?token=bad-token']}>
        <Routes>
          <Route path="/auth/accept-invitation" element={<AcceptInvitationScreen />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/invalid invitation/i)).toBeInTheDocument();
    expect(screen.getByText(/invalid token/i)).toBeInTheDocument();
  });

  it('navigates to register page and stores token on "Create Account" click', async () => {
    const mockInvitation = { invited_by_name: 'John Doe', company_name: 'Awesome Inc.' };
    vi.mocked(teamService.validateInvitationToken).mockResolvedValue(mockInvitation);

    render(
      <MemoryRouter initialEntries={['/auth/accept-invitation?token=test-token']}>
        <Routes>
          <Route path="/auth/accept-invitation" element={<AcceptInvitationScreen />} />
          <Route path="/auth/register" element={<div>Register Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const createButton = await screen.findByRole('button', { name: /create a new account/i });
    fireEvent.click(createButton);

    expect(localStorage.setItem).toHaveBeenCalledWith('pendingInvitationToken', 'test-token');
    expect(screen.getByText('Register Page')).toBeInTheDocument();
  });

  it('navigates to login page and stores token on "Log In" click', async () => {
    const mockInvitation = { invited_by_name: 'John Doe', company_name: 'Awesome Inc.' };
    vi.mocked(teamService.validateInvitationToken).mockResolvedValue(mockInvitation);

    render(
      <MemoryRouter initialEntries={['/auth/accept-invitation?token=test-token']}>
        <Routes>
          <Route path="/auth/accept-invitation" element={<AcceptInvitationScreen />} />
          <Route path="/auth/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const loginButton = await screen.findByRole('button', { name: /log in to existing account/i });
    fireEvent.click(loginButton);

    expect(localStorage.setItem).toHaveBeenCalledWith('pendingInvitationToken', 'test-token');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
