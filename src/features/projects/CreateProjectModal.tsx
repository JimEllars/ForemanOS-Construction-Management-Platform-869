import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useStore } from '../../store';
import { projectService } from '../../services/projectService';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose }) => {
  const { company, addProject } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    budget: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company?.id) return;

    setIsLoading(true);
    setError('');

    try {
      const projectData = {
        name: formData.name,
        description: formData.description || undefined,
        status: 'planning' as const,
        company_id: company.id,
        start_date: formData.start_date || undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
      };

      const newProject = await projectService.createProject(projectData);
      addProject(newProject);
      
      // Reset form and close modal
      setFormData({ name: '', description: '', start_date: '', budget: '' });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', start_date: '', budget: '' });
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Project"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter project name"
          required
        />
        
        <Input
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Project description (optional)"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
          />
          
          <Input
            label="Budget"
            name="budget"
            type="number"
            value={formData.budget}
            onChange={handleChange}
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>

        {error && (
          <div className="text-sm text-danger-600 bg-danger-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            type="submit"
            className="flex-1"
            disabled={isLoading || !formData.name.trim()}
          >
            {isLoading ? 'Creating...' : 'Create Project'}
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

export default CreateProjectModal;