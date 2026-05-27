import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Tabs } from '../../components/Tabs';

const tabs = [
  { key: 'one', label: 'First' },
  { key: 'two', label: 'Second' },
  { key: 'three', label: 'Third' },
];

describe('Tabs', () => {
  it('renders all tab labels', () => {
    render(<Tabs tabs={tabs} activeKey="one" onChange={() => {}} />);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('marks active tab with aria-selected', () => {
    render(<Tabs tabs={tabs} activeKey="two" onChange={() => {}} />);
    const activeTab = screen.getByRole('tab', { name: 'Second' });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onChange when tab is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} activeKey="one" onChange={onChange} />);

    await user.click(screen.getByText('Third'));
    expect(onChange).toHaveBeenCalledWith('three');
  });

  it('uses testIdPrefix for data-testid attributes', () => {
    render(<Tabs tabs={tabs} activeKey="one" onChange={() => {}} testIdPrefix="my-tabs" />);
    expect(screen.getByTestId('my-tabs-one')).toBeInTheDocument();
    expect(screen.getByTestId('my-tabs-two')).toBeInTheDocument();
  });

  it('supports keyboard navigation with ArrowRight', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} activeKey="one" onChange={onChange} />);

    const firstTab = screen.getByRole('tab', { name: 'First' });
    firstTab.focus();
    await user.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalledWith('two');
  });
});
