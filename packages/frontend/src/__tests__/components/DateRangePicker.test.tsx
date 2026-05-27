import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DateRangePicker } from '../../components/DateRangePicker';

describe('DateRangePicker', () => {
  it('renders trigger with placeholder when no range', () => {
    render(<DateRangePicker value={{ from: null, to: null }} onChange={() => {}} />);
    expect(screen.getByText('Any date')).toBeInTheDocument();
  });

  it('renders selected range in trigger', () => {
    render(<DateRangePicker value={{ from: '2026-01-01', to: '2026-01-31' }} onChange={() => {}} />);
    expect(screen.getByText('2026-01-01 → 2026-01-31')).toBeInTheDocument();
  });

  it('opens dropdown on trigger click', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker value={{ from: null, to: null }} onChange={() => {}} />);

    await user.click(screen.getByTestId('date-range-trigger'));
    expect(screen.getByTestId('date-range-dropdown')).toBeInTheDocument();
    expect(screen.getByTestId('date-preset-7d')).toBeInTheDocument();
  });

  it('calls onChange with preset range', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRangePicker value={{ from: null, to: null }} onChange={onChange} />);

    await user.click(screen.getByTestId('date-range-trigger'));
    await user.click(screen.getByTestId('date-preset-today'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const [arg] = onChange.mock.calls[0];
    expect(arg.from).toBe(arg.to);
  });

  it('clears range with Clear preset', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRangePicker value={{ from: '2026-01-01', to: null }} onChange={onChange} />);

    await user.click(screen.getByTestId('date-range-trigger'));
    await user.click(screen.getByTestId('date-preset-clear'));

    expect(onChange).toHaveBeenCalledWith({ from: null, to: null });
  });
});
