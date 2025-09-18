import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // Needed because StatCard can contain a Link
import StatCard from './StatCard';
import * as FiIcons from 'react-icons/fi';

const { FiUsers } = FiIcons;

describe('StatCard', () => {
  it('renders the title and value correctly', () => {
    render(
      <StatCard title="Total Users" value={123} icon={FiUsers} />
    );

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('renders without a link when href is not provided', () => {
    const { container } = render(
      <StatCard title="Total Users" value={123} icon={FiUsers} />
    );

    // The component should not contain an <a> tag
    expect(container.querySelector('a')).toBeNull();
  });

  it('renders as a link when href is provided', () => {
    const { container } = render(
      <MemoryRouter>
        <StatCard title="Total Users" value={123} icon={FiUsers} href="/users" />
      </MemoryRouter>
    );

    const linkElement = container.querySelector('a');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/users');
  });

  it('displays change information when provided', () => {
    render(
      <StatCard title="Total Users" value={123} icon={FiUsers} change="+5%" changeType="increase" />
    );

    expect(screen.getByText('+5%')).toBeInTheDocument();
    expect(screen.getByText('vs. last month')).toBeInTheDocument();
  });

  it('applies the correct color for increase change type', () => {
    render(
      <StatCard title="Total Users" value={123} icon={FiUsers} change="+5%" changeType="increase" />
    );

    const changeElement = screen.getByText('+5%');
    expect(changeElement).toHaveClass('text-success-600');
  });

  it('applies the correct color for decrease change type', () => {
    render(
      <StatCard title="Total Users" value={123} icon={FiUsers} change="-2%" changeType="decrease" />
    );

    const changeElement = screen.getByText('-2%');
    expect(changeElement).toHaveClass('text-danger-600');
  });
});
