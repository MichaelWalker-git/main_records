import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Tag } from '../../components/Tag';

describe('Tag', () => {
  it('renders content', () => {
    render(<Tag>Confidential</Tag>);
    expect(screen.getByText('Confidential')).toBeInTheDocument();
  });

  it('does not show remove button without onRemove', () => {
    render(<Tag>Static</Tag>);
    expect(screen.queryByLabelText('Remove tag')).not.toBeInTheDocument();
  });

  it('shows remove button with onRemove', () => {
    render(<Tag onRemove={() => {}}>Removable</Tag>);
    expect(screen.getByLabelText('Remove tag')).toBeInTheDocument();
  });

  it('calls onRemove when remove button clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<Tag onRemove={onRemove}>Removable</Tag>);

    await user.click(screen.getByLabelText('Remove tag'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('renders as button when onClick provided', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Tag onClick={onClick}>Click me</Tag>);

    await user.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
