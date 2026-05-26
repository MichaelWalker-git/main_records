import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { NotificationBell } from '../components/NotificationBell';
import { useAuth } from '../hooks/useAuth';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Move focus to main content on route change for screen readers
  useEffect(() => {
    const main = document.getElementById('main-content');
    if (main) {
      main.focus({ preventScroll: true });
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen">
      {/* Skip to content link — visible only on focus (keyboard nav) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-navy-500 focus:text-white focus:px-4 focus:py-2 focus:rounded focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="bg-white border-b border-slate-200 px-6 h-14 flex items-center justify-between flex-shrink-0"
          role="banner"
          data-testid="top-bar"
        >
          <div />
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="h-6 w-px bg-slate-200" aria-hidden="true" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-navy-500 flex items-center justify-center" aria-hidden="true">
                <span className="text-white text-xs font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <span className="text-sm text-slate-700 font-medium" data-testid="user-display-name">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-navy-500"
                aria-label="Sign out"
                data-testid="logout-button"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>
        <main
          id="main-content"
          className="flex-1 p-6 bg-slate-50 overflow-auto"
          role="main"
          tabIndex={-1}
          aria-label="Page content"
        >
          <Outlet />
        </main>

        {/* Live region for dynamic announcements (notifications, status changes) */}
        <div aria-live="polite" aria-atomic="true" className="sr-only" id="aria-live-region" />
      </div>
    </div>
  );
}