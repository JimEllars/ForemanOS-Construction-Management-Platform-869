import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { useStore } from '../../store';
import { timeTrackingService } from '../../services/timeTrackingService';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlay, FiClock } = FiIcons;

interface CreateTimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEntryCreated?: (entry: any) => void;
  preselectedProject?: string;
  startTimer?: boolean;
}

const CreateTimeEntryModal: React.FC<CreateTimeEntryModalProps> = ({
  isOpen,
  onClose,
  onEntryCreated,
  preselectedProject = '',
  startTimer = false
}) => {
  const { projects, tasks, user, addTimeEntry } = useStore();
  const [formData, setFormData] = useState({
    project_id: preselectedProject,
    task_id: '',
    start_time: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:MM format
    end_time: '',
    description: '',
    is_running: startTimer
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (preselectedProject) {
      setFormData(prev => ({ ...prev, project_id: preselectedProject }));
    }
  }, [preselectedProject]);

  const projectTasks = tasks.filter(task => task.project_id === formData.project_id);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      setErrors(['User not authenticated']);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      let newEntry;

      if (formData.is_running || startTimer) {
        // Start a timer
        newEntry = await timeTrackingService.startTimer(
          formData.project_id,
          formData.task_id || null,
          user.id,
          formData.description
        );
      } else {
        // Create a completed time entry
        const entryData = {
          project_id: formData.project_id,
          task_id: formData.task_id || null,
          user_id: user.id,
          start_time: formData.start_time,
          end_time: formData.end_time || new Date().toISOString(),
          duration_hours: formData.end_time ? 
            (new Date(formData.end_time).getTime() - new Date(formData.start_time).getTime()) / (1000 * 60 * 60) : 
            0,
          description: formData.description,
          is_running: false
        };

        // Validate entry data
        const validationErrors = timeTrackingService.validateTimeEntry(entryData);
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          return;
        }

        newEntry = await timeTrackingService.createTimeEntry(entryData);
      }
      
      // Add to store
      addTimeEntry(newEntry);
      
      // Notify parent component
      if (onEntryCreated) {
        onEntryCreated(newEntry);
      }

      // Reset form and close modal
      setFormData({
        project_id: '',
        task_id: '',
        start_time: new Date().toISOString().slice(0, 16),
        end_time: '',
        description: '',
        is_running: false
      });
      onClose();

    } catch (err: any) {
      console.error('Error creating time entry:', err);
      setErrors([err.message || 'Failed to create time entry']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      project_id: preselectedProject,
      task_id: '',
      start_time: new Date().toISOString().slice(0, 16),
      end_time: '',
      description: '',
      is_running: startTimer
    });
    setErrors([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={startTimer ? "Start New Timer" : "Add Time Entry"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project and Task */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Project *
            </label>
            <select
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Task (Optional)
            </label>
            <select
              name="task_id"
              value={formData.task_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a task (optional)</option>
              {projectTasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timer vs Manual Entry Toggle */}
        {!startTimer && (
          <div className="flex items-center space-x-3">
            <input
              id="is_running"
              name="is_running"
              type="checkbox"
              checked={formData.is_running}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
            />
            <label htmlFor="is_running" className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
              Start timer immediately
            </label>
          </div>
        )}

        {/* Time Fields (only show if not starting timer) */}
        {!formData.is_running && !startTimer && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Time *"
              name="start_time"
              type="datetime-local"
              value={formData.start_time}
              onChange={handleChange}
              required
            />
            <Input
              label="End Time *"
              name="end_time"
              type="datetime-local"
              value={formData.end_time}
              onChange={handleChange}
              required={!formData.is_running}
            />
          </div>
        )}

        {/* Description */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the work performed..."
            rows={3}
            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Timer Info */}
        {(formData.is_running || startTimer) && (
          <div className="bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-800 rounded-md p-4">
            <div className="flex items-center">
              <SafeIcon icon={FiPlay} className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
              <div>
                <h4 className="font-medium text-primary-900 dark:text-primary-100">Timer Mode</h4>
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  A timer will start immediately after creation. You can stop it later from the time tracking screen.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-danger-50 dark:bg-danger-900 border border-danger-200 dark:border-danger-800 rounded-md p-3">
            <ul className="text-sm text-danger-700 dark:text-danger-300 space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="flex items-center">
                  <SafeIcon icon={FiClock} className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex space-x-3 pt-4 border-t border-secondary-200 dark:border-secondary-700">
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading || !formData.project_id}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {formData.is_running || startTimer ? 'Starting Timer...' : 'Creating Entry...'}
              </>
            ) : (
              <>
                <SafeIcon icon={formData.is_running || startTimer ? FiPlay : FiClock} className="w-4 h-4 mr-2" />
                {formData.is_running || startTimer ? 'Start Timer' : 'Add Time Entry'}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTimeEntryModal;