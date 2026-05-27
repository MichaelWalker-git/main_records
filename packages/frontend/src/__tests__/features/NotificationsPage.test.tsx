import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToastProvider } from '../../components/Toast';
import { NotificationsPage } from '../../features/admin/NotificationsPage';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-1', email: 'sarah.chen@maine.gov' },
  })),
}));

function renderPage() {
  return render(
    <ToastProvider>
      <NotificationsPage />
    </ToastProvider>
  );
}

function makeStorageMock(): Storage {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    key: (i: number) => Object.keys(store)[i] ?? null,
    get length() { return Object.keys(store).length; },
  };
}

describe('NotificationsPage Save Preferences', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: makeStorageMock(),
      configurable: true,
      writable: true,
    });
  });

  it('renders with default toggles applied', () => {
    renderPage();
    const emailToggle = screen.getByTestId('toggle-retention_alert-email');
    expect(emailToggle).toHaveAttribute('aria-pressed', 'true');

    const transmittalEmail = screen.getByTestId('toggle-transmittal_status-email');
    expect(transmittalEmail).toHaveAttribute('aria-pressed', 'false');
  });

  it('disables Save when there are no changes', () => {
    renderPage();
    expect(screen.getByTestId('save-prefs-button')).toBeDisabled();
  });

  it('enables Save after toggling a preference', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByTestId('toggle-retention_alert-email'));
    expect(screen.getByTestId('save-prefs-button')).not.toBeDisabled();
  });

  it('persists toggle changes to localStorage on Save', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByTestId('toggle-retention_alert-email'));
    await user.click(screen.getByTestId('save-prefs-button'));

    await waitFor(() => {
      expect(screen.getByTestId('save-prefs-button')).toBeDisabled();
    });

    const stored = localStorage.getItem('maine-rms:notification-prefs:user-1');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.retention_alert.email).toBe(false);
  });

  it('restores stored preferences on remount', async () => {
    localStorage.setItem(
      'maine-rms:notification-prefs:user-1',
      JSON.stringify({ overdue_notice: { email: false, inApp: false } })
    );

    renderPage();

    await waitFor(() => {
      const overdueEmail = screen.getByTestId('toggle-overdue_notice-email');
      expect(overdueEmail).toHaveAttribute('aria-pressed', 'false');
    });
  });

  it('reset returns to defaults and marks dirty', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByTestId('toggle-retention_alert-email'));
    await user.click(screen.getByTestId('reset-prefs-button'));

    const emailToggle = screen.getByTestId('toggle-retention_alert-email');
    expect(emailToggle).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('save-prefs-button')).not.toBeDisabled();
  });
});
