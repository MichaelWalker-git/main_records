import { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useApiQuery } from '../hooks/useApi';
import { Notification } from '../types';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications = [] } = useApiQuery<Notification[]>(
    ['notifications'],
    '/notifications?limit=10'
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" data-testid="notification-bell">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        data-testid="notification-bell-button"
      >
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50" data-testid="notification-dropdown">
          <div className="px-4 py-3 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-500 text-center">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-slate-100 last:border-0 ${
                    notification.read ? '' : 'bg-blue-50'
                  }`}
                >
                  <p className="text-sm font-medium text-slate-800">{notification.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
