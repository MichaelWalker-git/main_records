import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FilterBar } from '../../components/FilterBar';

describe('FilterBar', () => {
  it('renders nothing when no active filters', () => {
    const { container } = render(<FilterBar filters={[]} onRemove={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders active filter chips', () => {
    render(
      <FilterBar
        filters={[
          { key: 'status', label: 'Status', value: 'active' },
          { key: 'agency', label: 'Agency', value: 'DOT' },
        ]}
        onRemove={() => {}}
      />
    );
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('DOT')).toBeInTheDocument();
  });

  it('calls onRemove when chip remove clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <FilterBar
        filters={[{ key: 'status', label: 'Status', value: 'active' }]}
        onRemove={onRemove}
      />
    );

    const removeBtn = screen.getByLabelText('Remove tag');
    await user.click(removeBtn);
    expect(onRemove).toHaveBeenCalledWith('status');
  });

  it('shows Clear all when 2+ filters and onClearAll provided', () => {
    render(
      <FilterBar
        filters={[
          { key: 'a', label: 'A', value: '1' },
          { key: 'b', label: 'B', value: '2' },
        ]}
        onRemove={() => {}}
        onClearAll={() => {}}
      />
    );
    expect(screen.getByTestId('filter-bar-clear-all')).toBeInTheDocument();
  });

  it('does not show Clear all with single filter', () => {
    render(
      <FilterBar
        filters={[{ key: 'a', label: 'A', value: '1' }]}
        onRemove={() => {}}
        onClearAll={() => {}}
      />
    );
    expect(screen.queryByTestId('filter-bar-clear-all')).not.toBeInTheDocument();
  });
});
