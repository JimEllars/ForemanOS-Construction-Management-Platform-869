import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { useStore } from '../../store';
import { dailyLogService } from '../../services/dailyLogService';
import { DailyLog } from '../../types';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiSun, FiCloud, FiCloudRain, FiCloudSnow, FiWind } = FiIcons;

interface EditDailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyLog: DailyLog | null;
  onLogUpdated?: (log: DailyLog) => void;
}

const EditDailyLogModal: React.FC<EditDailyLogModalProps> = ({
  isOpen,
  onClose,
  dailyLog,
  onLogUpdated
}) => {
  const { projects, updateDailyLog } = useStore();
  const [formData, setFormData] = useState({
    project_id: '',
    date: '',
    weather: 'sunny',
    work_completed: '',
    materials_used: '',
    crew_present: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const weatherOptions = [
    { value: 'sunny', label: 'Sunny', icon: FiSun, color: 'text-yellow-500' },
    { value: 'cloudy', label: 'Cloudy', icon: FiCloud, color: 'text-gray-500' },
    { value: 'rainy', label: 'Rainy', icon: FiCloudRain, color: 'text-blue-500' },
    { value: 'snowy', label: 'Snowy', icon: FiCloudSnow, color: 'text-blue-300' },
    { value: 'windy', label: 'Windy', icon: FiWind, color: 'text-gray-600' }
  ];

  useEffect(() => {
    if (dailyLog) {
      setFormData({
        project_id: dailyLog.project_id || '',
        date: dailyLog.date || '',
        weather: dailyLog.weather || 'sunny',
        work_completed: dailyLog.work_completed || '',
        materials_used: dailyLog.materials_used || '',
        crew_present: dailyLog.crew_present || '',
        notes: dailyLog.notes || ''
      });
    }
  }, [dailyLog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dailyLog?.id) {
      setErrors(['Daily log ID is missing']);
      return;
    }

    // Validate form data
    const validationErrors = dailyLogService.validateDailyLog(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const updatedLog = await dailyLogService.updateDailyLog(dailyLog.id, formData);
      
      // Update store
      updateDailyLog(dailyLog.id, updatedLog);
      
      // Notify parent component
      if (onLogUpdated) {
        onLogUpdated(updatedLog);
      }

      onClose();

    } catch (err: any) {
      console.error('Error updating daily log:', err);
      setErrors([err.message || 'Failed to update daily log']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setErrors([]);
    onClose();
  };

  if (!dailyLog) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Daily Log"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project and Date */}
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

          <Input
            label="Date *"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            max={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        {/* Weather Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Weather Conditions
          </label>
          <div className="grid grid-cols-5 gap-2">
            {weatherOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, weather: option.value }))}
                className={`p-3 rounded-md border-2 transition-colors ${
                  formData.weather === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                    : 'border-secondary-300 dark:border-secondary-600 hover:border-primary-300'
                }`}
              >
                <SafeIcon 
                  icon={option.icon} 
                  className={`w-6 h-6 mx-auto mb-1 ${option.color}`}
                />
                <span className="text-xs font-medium text-secondary-700 dark:text-secondary-300">
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Work Completed */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Work Completed *
          </label>
          <textarea
            name="work_completed"
            value={formData.work_completed}
            onChange={handleChange}
            placeholder="Describe the work completed today in detail..."
            rows={4}
            required
            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Materials Used */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Materials Used
          </label>
          <textarea
            name="materials_used"
            value={formData.materials_used}
            onChange={handleChange}
            placeholder="List materials, quantities, and suppliers used..."
            rows={3}
            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Crew Present */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Crew Present
          </label>
          <textarea
            name="crew_present"
            value={formData.crew_present}
            onChange={handleChange}
            placeholder="List crew members, roles, and hours worked..."
            rows={3}
            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Additional Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional observations, issues, or important information..."
            rows={3}
            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-md bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-danger-50 dark:bg-danger-900 border border-danger-200 dark:border-danger-800 rounded-md p-3">
            <ul className="text-sm text-danger-700 dark:text-danger-300 space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="flex items-center">
                  <SafeIcon icon={FiCloudRain} className="w-4 h-4 mr-2 flex-shrink-0" />
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
            disabled={isLoading || !formData.project_id || !formData.work_completed.trim()}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating Log...
              </>
            ) : (
              'Update Daily Log'
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

export default EditDailyLogModal;