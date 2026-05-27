import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Tooltip } from '../../components/Tooltip';

describe('Tooltip', () => {
  it('renders children', () => {
    render(<Tooltip content="Tip text"><button>Hover me</button></Tooltip>);
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
  });

  it('does not show tooltip initially', () => {
    render(<Tooltip content="Tip text"><button>Hover me</button></Tooltip>);
    expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus after delay', async () => {
    const user = userEvent.setup();
    render(<Tooltip content="Tip text" delay={0}><button>Hover me</button></Tooltip>);

    await user.tab();

    await waitFor(() => {
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
    expect(screen.getByText('Tip text')).toBeInTheDocument();
  });

  it('hides tooltip on blur', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Tooltip content="Tip text" delay={0}><button>Hover me</button></Tooltip>
        <button>Other</button>
      </div>
    );

    await user.tab();
    await waitFor(() => {
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });

    await user.tab();
    expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument();
  });
});
