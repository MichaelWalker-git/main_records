import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Timeline } from '../../components/Timeline';

describe('Timeline', () => {
  it('renders nothing when events array is empty', () => {
    const { container } = render(<Timeline events={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders events with labels', () => {
    const events = [
      { id: '1', label: 'Created', variant: 'default' as const },
      { id: '2', label: 'Submitted', variant: 'success' as const },
    ];
    render(<Timeline events={events} />);
    expect(screen.getByText('Created')).toBeInTheDocument();
    expect(screen.getByText('Submitted')).toBeInTheDocument();
  });

  it('renders actor and timestamp', () => {
    const events = [
      { id: '1', label: 'Approved', actor: 'John Doe', timestamp: 'Jan 5, 2024 10:00 AM' },
    ];
    render(<Timeline events={events} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jan 5, 2024 10:00 AM')).toBeInTheDocument();
  });

  it('renders details text', () => {
    const events = [
      { id: '1', label: 'Received', details: 'Physical boxes verified' },
    ];
    render(<Timeline events={events} />);
    expect(screen.getByText('Physical boxes verified')).toBeInTheDocument();
  });

  it('has data-testid on container', () => {
    const events = [{ id: '1', label: 'Test' }];
    render(<Timeline events={events} />);
    expect(screen.getByTestId('timeline')).toBeInTheDocument();
  });

  it('applies variant colors to dots', () => {
    const events = [
      { id: '1', label: 'Danger event', variant: 'danger' as const },
    ];
    render(<Timeline events={events} />);
    const dot = screen.getByTestId('timeline').querySelector('.bg-red-500');
    expect(dot).toBeInTheDocument();
  });
});
