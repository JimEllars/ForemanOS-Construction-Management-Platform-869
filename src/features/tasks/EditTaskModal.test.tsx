import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EditTaskModal from './EditTaskModal';
import { useStore } from '../../store';
import { taskService } from '../../services/taskService';
import { Task } from '../../types';

// Mock the services and store
vi.mock('../../services/taskService');
vi.mock('../../store');

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  project_id: '1',
  assigned_to: 'user-123',
  status: 'todo',
  priority: 'medium',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('EditTaskModal', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock useStore
    vi.mocked(useStore).mockReturnValue({
      projects: [{ id: '1', name: 'Test Project' }],
      updateTask: vi.fn(),
    });
  });

  it('calls sendTaskNotification when assignee is changed', async () => {
    vi.mocked(taskService.updateTask).mockResolvedValue({ ...mockTask, assigned_to: 'user-456' });
    vi.mocked(taskService.sendTaskNotification).mockResolvedValue({ success: true });

    render(
      <MemoryRouter>
        <EditTaskModal isOpen={true} onClose={() => {}} task={mockTask} />
      </MemoryRouter>
    );

    // Change the assignee
    fireEvent.change(screen.getByLabelText('Assigned To'), { target: { value: 'user-456' } });

    // Submit the form
    fireEvent.click(screen.getByText('Update Task'));

    // Wait for the async operations to complete
    await screen.findByText('Update Task');

    // Check if the notification service was called
    expect(taskService.sendTaskNotification).toHaveBeenCalledWith('1', 'user-456');
  });

  it('does not call sendTaskNotification when assignee is not changed', async () => {
    vi.mocked(taskService.updateTask).mockResolvedValue(mockTask);

    render(
      <MemoryRouter>
        <EditTaskModal isOpen={true} onClose={() => {}} task={mockTask} />
      </MemoryRouter>
    );

    // Submit the form without changing the assignee
    fireEvent.click(screen.getByText('Update Task'));

    // Wait for the async operations to complete
    await screen.findByText('Update Task');

    // Check that the notification service was not called
    expect(taskService.sendTaskNotification).not.toHaveBeenCalled();
  });

  it('calls sendTaskNotification when a task is assigned to a new user (was previously unassigned)', async () => {
    const unassignedTask = { ...mockTask, assigned_to: undefined };
    vi.mocked(taskService.updateTask).mockResolvedValue({ ...unassignedTask, assigned_to: 'user-789' });
    vi.mocked(taskService.sendTaskNotification).mockResolvedValue({ success: true });

    render(
      <MemoryRouter>
        <EditTaskModal isOpen={true} onClose={() => {}} task={unassignedTask} />
      </MemoryRouter>
    );

    // Change the assignee
    fireEvent.change(screen.getByLabelText('Assigned To'), { target: { value: 'user-789' } });

    // Submit the form
    fireEvent.click(screen.getByText('Update Task'));

    // Wait for the async operations to complete
    await screen.findByText('Update Task');

    // Check if the notification service was called
    expect(taskService.sendTaskNotification).toHaveBeenCalledWith('1', 'user-789');
  });
});
