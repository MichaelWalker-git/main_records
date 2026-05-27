import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DiffView } from '../../components/DiffView';

describe('DiffView', () => {
  it('shows empty state when no changes', () => {
    render(<DiffView before={{ a: 1 }} after={{ a: 1 }} />);
    expect(screen.getByTestId('diff-view-empty')).toBeInTheDocument();
  });

  it('renders changed fields', () => {
    render(<DiffView before={{ status: 'draft' }} after={{ status: 'active' }} />);
    expect(screen.getByText('status')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('shows only added fields when before is empty', () => {
    render(<DiffView before={null} after={{ title: 'New' }} />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('shows only removed fields when after is empty', () => {
    render(<DiffView before={{ title: 'Old' }} after={null} />);
    expect(screen.getByText('Old')).toBeInTheDocument();
  });

  it('handles object values', () => {
    render(
      <DiffView
        before={{ tags: ['a', 'b'] }}
        after={{ tags: ['a', 'c'] }}
      />
    );
    expect(screen.getByTestId('diff-view')).toBeInTheDocument();
  });
});
