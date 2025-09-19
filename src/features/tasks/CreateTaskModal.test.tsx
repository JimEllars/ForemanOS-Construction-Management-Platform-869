import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CreateTaskModal from './CreateTaskModal';
import { useStore } from '../../store';
import { taskService } from '../../services/taskService';

// Mock the services and store
vi.mock('../../services/taskService');
vi.mock('../../store');

describe('CreateTaskModal', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock useStore
    vi.mocked(useStore).mockReturnValue({
      projects: [{ id: '1', name: 'Test Project' }],
      addTask: vi.fn(),
    });
  });

  it('calls sendTaskNotification when a task is created with an assignee', async () => {
    const mockTask = {
      id: '1',
      title: 'Test Task',
      project_id: '1',
      assigned_to: 'user-123',
    };
    vi.mocked(taskService.createTask).mockResolvedValue(mockTask);
    vi.mocked(taskService.sendTaskNotification).mockResolvedValue({ success: true });

    render(
      <MemoryRouter>
        <CreateTaskModal isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Task Title'), { target: { value: 'Test Task' } });
    fireEvent.change(screen.getByLabelText('Project'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Assigned To'), { target: { value: 'user-123' } });

    // Submit the form
    fireEvent.click(screen.getByText('Create Task'));

    // Wait for the async operations to complete
    await screen.findByText('Create Task');

    // Check if the notification service was called
    expect(taskService.sendTaskNotification).toHaveBeenCalledWith('1', 'user-123');
  });

  it('does not call sendTaskNotification when a task is created without an assignee', async () => {
    const mockTask = {
      id: '1',
      title: 'Test Task',
      project_id: '1',
      assigned_to: undefined,
    };
    vi.mocked(taskService.createTask).mockResolvedValue(mockTask);

    render(
      <MemoryRouter>
        <CreateTaskModal isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Task Title'), { target: { value: 'Test Task' } });
    fireEvent.change(screen.getByLabelText('Project'), { target: { value: '1' } });

    // Submit the form
    fireEvent.click(screen.getByText('Create Task'));

    // Wait for the async operations to complete
    await screen.findByText('Create Task');

    // Check that the notification service was not called
    expect(taskService.sendTaskNotification).not.toHaveBeenCalled();
  });
});
