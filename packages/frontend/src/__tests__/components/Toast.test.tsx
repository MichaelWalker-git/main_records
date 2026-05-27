import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ToastProvider, useToast } from '../../components/Toast';

function ToastTrigger({ message, variant }: { message: string; variant?: 'success' | 'error' | 'info' | 'warning' }) {
  const { toast } = useToast();
  return <button onClick={() => toast(message, variant)}>Fire</button>;
}

describe('Toast', () => {
  it('renders toast message inside provider', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastTrigger message="Hello" />
      </ToastProvider>
    );

    await user.click(screen.getByText('Fire'));
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders multiple variants', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastTrigger message="Saved" variant="success" />
      </ToastProvider>
    );

    await user.click(screen.getByText('Fire'));
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });
});

describe('useToast outside ToastProvider', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('does not throw when no provider is mounted', () => {
    expect(() => render(<ToastTrigger message="No provider" />)).not.toThrow();
  });

  it('logs a warning the first time a toast is suppressed', async () => {
    const user = userEvent.setup();
    render(<ToastTrigger message="No provider" />);

    await user.click(screen.getByText('Fire'));
    expect(warnSpy).toHaveBeenCalled();
    const firstCall = warnSpy.mock.calls[0]?.[0];
    expect(typeof firstCall).toBe('string');
    expect(String(firstCall)).toContain('useToast called outside ToastProvider');
  });
});
