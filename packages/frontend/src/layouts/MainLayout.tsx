import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { NotificationBell } from '../components/NotificationBell';
import { useAuth } from '../hooks/useAuth';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between" data-testid="top-bar">
          <div />
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-700" data-testid="user-display-name">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                aria-label="Sign out"
                data-testid="logout-button"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 bg-slate-50 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
