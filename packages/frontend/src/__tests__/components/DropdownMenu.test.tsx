import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DropdownMenu } from '../../components/DropdownMenu';

describe('DropdownMenu', () => {
  it('does not render panel by default', () => {
    render(<DropdownMenu items={[{ key: 'a', label: 'Action' }]} />);
    expect(screen.queryByTestId('dropdown-panel')).not.toBeInTheDocument();
  });

  it('opens panel on trigger click', async () => {
    const user = userEvent.setup();
    render(<DropdownMenu items={[{ key: 'a', label: 'Action' }]} />);

    await user.click(screen.getByTestId('dropdown-trigger'));
    expect(screen.getByTestId('dropdown-panel')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('calls onClick and closes panel when item clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<DropdownMenu items={[{ key: 'a', label: 'Action', onClick }]} />);

    await user.click(screen.getByTestId('dropdown-trigger'));
    await user.click(screen.getByTestId('dropdown-item-a'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('dropdown-panel')).not.toBeInTheDocument();
  });

  it('renders separator', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        items={[
          { key: 'a', label: 'A' },
          { key: 'sep', separator: true },
          { key: 'b', label: 'B' },
        ]}
      />
    );

    await user.click(screen.getByTestId('dropdown-trigger'));
    const panel = screen.getByTestId('dropdown-panel');
    expect(panel.querySelector('[role="separator"]')).toBeInTheDocument();
  });

  it('applies danger styling to danger items', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu
        items={[{ key: 'del', label: 'Delete', danger: true, onClick: () => {} }]}
      />
    );

    await user.click(screen.getByTestId('dropdown-trigger'));
    const item = screen.getByTestId('dropdown-item-del');
    expect(item.className).toContain('text-red-600');
  });

  it('does not call onClick for disabled items', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <DropdownMenu
        items={[{ key: 'a', label: 'Action', onClick, disabled: true }]}
      />
    );

    await user.click(screen.getByTestId('dropdown-trigger'));
    const item = screen.getByTestId('dropdown-item-a');
    expect(item).toBeDisabled();
    await user.click(item);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<DropdownMenu items={[{ key: 'a', label: 'Action', onClick: () => {} }]} />);

    await user.click(screen.getByTestId('dropdown-trigger'));
    expect(screen.getByTestId('dropdown-panel')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByTestId('dropdown-panel')).not.toBeInTheDocument();
    });
  });

  it('opens with ArrowDown on trigger', async () => {
    const user = userEvent.setup();
    render(<DropdownMenu items={[{ key: 'a', label: 'Action' }]} />);

    const trigger = screen.getByTestId('dropdown-trigger');
    trigger.focus();
    await user.keyboard('{ArrowDown}');

    expect(screen.getByTestId('dropdown-panel')).toBeInTheDocument();
  });
});
