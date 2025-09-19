import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'zustand/vanilla';
import { createDataSlice, DataSlice } from './dataSlice';
import { Project } from '../types';

// Mock initial state for a clean slate in each test
const getInitialState = () => ({
  projects: [],
  tasks: [],
  clients: [],
  dailyLogs: [],
  isLoading: false,
});

// Create a test store
const store = createStore<DataSlice>((set, get, api) => createDataSlice(set, get, api));
const { getState, setState } = store;

describe('dataSlice', () => {
  // Reset store before each test
  beforeEach(() => {
    setState(getInitialState());
  });

  it('should set projects', () => {
    const projects: Project[] = [{ id: '1', name: 'Test Project' } as Project];
    getState().setProjects(projects);
    expect(getState().projects).toEqual(projects);
  });

  it('should add a project', () => {
    const project: Project = { id: '1', name: 'New Project' } as Project;
    getState().addProject(project);
    expect(getState().projects).toHaveLength(1);
    expect(getState().projects[0]).toEqual(project);
  });

  it('should update a project', () => {
    const initialProject: Project = { id: '1', name: 'Old Name' } as Project;
    setState({ projects: [initialProject] });

    const updates = { name: 'New Name' };
    getState().updateProject('1', updates);

    expect(getState().projects[0].name).toBe('New Name');
  });

  it('should not mutate other projects when updating', () => {
    const project1: Project = { id: '1', name: 'Project One' } as Project;
    const project2: Project = { id: '2', name: 'Project Two' } as Project;
    setState({ projects: [project1, project2] });

    getState().updateProject('2', { name: 'Updated Project Two' });

    expect(getState().projects.find(p => p.id === '1')?.name).toBe('Project One');
  });

  it('should remove a project', () => {
    const project1: Project = { id: '1', name: 'To Be Deleted' } as Project;
    const project2: Project = { id: '2', name: 'To Keep' } as Project;
    setState({ projects: [project1, project2] });

    getState().removeProject('1');

    expect(getState().projects).toHaveLength(1);
    expect(getState().projects[0].id).toBe('2');
  });

  it('should handle removing a non-existent project gracefully', () => {
    const project1: Project = { id: '1', name: 'Project One' } as Project;
    setState({ projects: [project1] });

    getState().removeProject('2'); // ID that does not exist

    expect(getState().projects).toHaveLength(1);
  });
});
