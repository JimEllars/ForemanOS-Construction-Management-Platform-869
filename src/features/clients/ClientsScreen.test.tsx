import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ClientsScreen from './ClientsScreen';
import { useSupabaseData } from '../../hooks/useSupabaseData';
import { useStore } from '../../store';

// Mock the hooks
vi.mock('../../store');

// Mock child components to simplify testing
vi.mock('./CreateClientModal', () => ({
  default: ({ isOpen, onClose }) => (isOpen ? <div data-testid="create-client-modal">CreateClientModal</div> : null),
}));

vi.mock('./EditClientModal', () => ({
  default: ({ client, isOpen, onClose }) => (isOpen ? <div data-testid="edit-client-modal">EditClientModal</div> : null),
}));


const mockClientsData = [
  { id: '1', name: 'Client A', email: 'a@test.com', phone: '111', company_id: '456', created_at: new Date().toISOString(), address: '123 Main St' },
  { id: '2', name: 'Client B', email: 'b@test.com', phone: '222', company_id: '456', created_at: new Date().toISOString(), address: '456 Oak Ave' },
];

describe('ClientsScreen', () => {
  const setupMockStore = (clients = mockClientsData) => {
    vi.mocked(useStore).mockImplementation((selector) => {
      const state = {
        clients,
        removeClient: vi.fn(),
        user: { id: '123', company_id: '456', name: 'Test User', email: 'test@test.com' },
        company: { id: '456', name: 'Test Company' },
      };
      if (typeof selector === 'function') {
        return selector(state);
      }
      return state;
    });
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('displays a message when there are no clients', () => {
    setupMockStore([]);
    render(<MemoryRouter><ClientsScreen /></MemoryRouter>);
    expect(screen.getByText('No clients yet')).toBeInTheDocument();
    expect(screen.getByText('Get started by adding your first client')).toBeInTheDocument();
  });

  it('displays a list of clients', () => {
    setupMockStore();
    render(<MemoryRouter><ClientsScreen /></MemoryRouter>);

    expect(screen.getByText('Client A')).toBeInTheDocument();
    expect(screen.getByText('a@test.com')).toBeInTheDocument();
    expect(screen.getByText('Client B')).toBeInTheDocument();
    expect(screen.getByText('b@test.com')).toBeInTheDocument();
  });

  it('opens the "Add Client" modal when the button is clicked', async () => {
    setupMockStore([]);
    render(<MemoryRouter><ClientsScreen /></MemoryRouter>);

    const addClientButton = screen.getByRole('button', { name: /add client/i });
    fireEvent.click(addClientButton);

    expect(await screen.findByTestId('create-client-modal')).toBeInTheDocument();
  });

  it('filters the list of clients based on search input', () => {
    setupMockStore();
    render(<MemoryRouter><ClientsScreen /></MemoryRouter>);

    expect(screen.getByText('Client A')).toBeInTheDocument();
    expect(screen.getByText('Client B')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Search clients by name, email, or phone...');
    fireEvent.change(searchInput, { target: { value: 'Client A' } });

    expect(screen.getByText('Client A')).toBeInTheDocument();
    expect(screen.queryByText('Client B')).not.toBeInTheDocument();
  });

  // Note: Loading and error states are now part of the global store and might be tested at a higher level.
  // If they were managed locally in this component, we would add tests for them here.
});
