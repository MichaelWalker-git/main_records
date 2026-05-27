import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DashboardWidget } from '../../components/DashboardWidget';

describe('DashboardWidget', () => {
  it('renders label and value', () => {
    render(<DashboardWidget label="Active Records" value={1234} />);
    expect(screen.getByText('Active Records')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(<DashboardWidget label="Status" value="—" />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders trend indicator when provided', () => {
    render(<DashboardWidget label="Records" value={500} trend="up" trendValue="+12%" />);
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('does not render trend when not provided', () => {
    render(<DashboardWidget label="Records" value={500} />);
    expect(screen.queryByText('vs last month')).not.toBeInTheDocument();
  });

  it('has data-testid attribute', () => {
    render(<DashboardWidget label="Test" value={0} />);
    expect(screen.getByTestId('dashboard-widget')).toBeInTheDocument();
  });
});