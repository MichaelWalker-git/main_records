import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AlertBanner } from '../../components/AlertBanner';

describe('AlertBanner', () => {
  it('renders children content', () => {
    render(<AlertBanner>Important message</AlertBanner>);
    expect(screen.getByText('Important message')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(<AlertBanner title="Heads up">Body text</AlertBanner>);
    expect(screen.getByText('Heads up')).toBeInTheDocument();
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('applies variant via data attribute', () => {
    render(<AlertBanner variant="danger">Error</AlertBanner>);
    expect(screen.getByTestId('alert-banner')).toHaveAttribute('data-variant', 'danger');
  });

  it('defaults to info variant', () => {
    render(<AlertBanner>Default</AlertBanner>);
    expect(screen.getByTestId('alert-banner')).toHaveAttribute('data-variant', 'info');
  });

  it('renders dismiss button when onDismiss provided', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<AlertBanner onDismiss={onDismiss}>Dismissable</AlertBanner>);

    const button = screen.getByLabelText('Dismiss');
    await user.click(button);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not render dismiss button without onDismiss', () => {
    render(<AlertBanner>Static</AlertBanner>);
    expect(screen.queryByLabelText('Dismiss')).not.toBeInTheDocument();
  });

  it('renders action element', () => {
    render(<AlertBanner action={<button>Take action</button>}>Body</AlertBanner>);
    expect(screen.getByRole('button', { name: 'Take action' })).toBeInTheDocument();
  });
});
