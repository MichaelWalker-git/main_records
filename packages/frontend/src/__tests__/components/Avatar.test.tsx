import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar, UserChip } from '../../components/Avatar';

describe('Avatar', () => {
  it('renders initials from full name', () => {
    render(<Avatar name="Sarah Chen" />);
    expect(screen.getByText('SC')).toBeInTheDocument();
  });

  it('renders 2-char initials from single-word name', () => {
    render(<Avatar name="Sarah" />);
    expect(screen.getByText('SA')).toBeInTheDocument();
  });

  it('falls back to email when name absent', () => {
    render(<Avatar email="user@maine.gov" />);
    expect(screen.getByText('US')).toBeInTheDocument();
  });

  it('renders ? when nothing provided', () => {
    render(<Avatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('uses same color for same name', () => {
    const { container: c1 } = render(<Avatar name="Sarah Chen" />);
    const { container: c2 } = render(<Avatar name="Sarah Chen" />);
    const class1 = c1.querySelector('span')?.className;
    const class2 = c2.querySelector('span')?.className;
    expect(class1).toBe(class2);
  });
});

describe('UserChip', () => {
  it('renders name and avatar', () => {
    render(<UserChip name="Sarah Chen" />);
    expect(screen.getByText('SC')).toBeInTheDocument();
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
  });

  it('renders role when provided', () => {
    render(<UserChip name="Sarah Chen" role="admin" />);
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('falls back to "Unknown" when name and email missing', () => {
    render(<UserChip />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});
