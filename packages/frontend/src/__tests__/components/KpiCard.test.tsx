import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { KpiCard } from '../../components/KpiCard';

describe('KpiCard', () => {
  it('renders label and formatted value', () => {
    render(<KpiCard label="Total Records" value={1234} />);
    expect(screen.getByText('Total Records')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(<KpiCard label="Status" value="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<KpiCard label="Clickable" value={42} onClick={handleClick} />);

    await user.click(screen.getByTestId('kpi-card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has role=button when clickable', () => {
    render(<KpiCard label="Clickable" value={0} onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not have role=button when not clickable', () => {
    render(<KpiCard label="Static" value={0} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
