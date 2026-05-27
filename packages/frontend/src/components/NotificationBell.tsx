import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon } from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '../hooks/useApi';
import { Notification } from '../types';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';

interface NotificationsResponse {
  data: Notification[];
  unreadCount: number;
}

function entityRoute(notification: any): string | null {
  const type = notification.entity_type || notification.entityType;
  const id = notification.entity_id || notification.entityId;
  if (!type || !id) return null;
  switch (type) {
    case 'record':
      return `/records/${id}`;
    case 'transmittal':
      return `/transmittals/${id}`;
    case 'disposition':
      return `/dispositions/${id}`;
    default:
      return null;
  }
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: response } = useApiQuery<NotificationsResponse>(
    ['notifications'],
    '/notifications?limit=10'
  );

  const notifications = response?.data ?? [];
  const unreadCount = response?.unreadCount ?? 0;

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  async function handleClick(notification: any) {
    setIsOpen(false);
    const route = entityRoute(notification);
    const isRead = notification.isRead ?? notification.is_read;
    if (!isRead) {
      try {
        await api.patch(`/notifications/${notification.id}/read`);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      } catch {
        // non-blocking
      }
    }
    if (route) navigate(route);
  }

  return (
    <div className="relative" ref={dropdownRef} data-testid="notification-bell">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        data-testid="notification-bell-button"
      >
        <BellIcon className="w-5 h-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center" aria-hidden="true">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50"
          role="region"
          aria-label="Notifications panel"
          data-testid="notification-dropdown"
        >
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800" id="notifications-heading">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-medium text-navy-600 bg-navy-50 border border-navy-200 rounded px-1.5 py-0.5">
                {unreadCount} unread
              </span>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto" role="list" aria-labelledby="notifications-heading">
            {notifications.length === 0 ? (
              <li className="px-4 py-6 text-sm text-slate-500 text-center">No notifications</li>
            ) : (
              notifications.map((notification: any) => {
                const isRead = notification.isRead ?? notification.is_read;
                const route = entityRoute(notification);
                const interactive = !!route || !isRead;
                return (
                  <li
                    key={notification.id}
                    className={`border-b border-slate-100 last:border-0 ${isRead ? '' : 'bg-blue-50'}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleClick(notification)}
                      disabled={!interactive}
                      className={`w-full text-left px-4 py-3 ${interactive ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default'}`}
                      data-testid={`notification-item-${notification.id}`}
                    >
                      <div className="flex items-start gap-2">
                        {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-navy-500 flex-shrink-0 mt-1.5" aria-hidden="true" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{notification.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt || notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
