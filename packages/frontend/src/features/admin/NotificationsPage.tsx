import { useState, useEffect } from 'react';
import { BellIcon, EnvelopeIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../hooks/useAuth';

interface NotificationPref {
  id: string;
  label: string;
  description: string;
  email: boolean;
  inApp: boolean;
}

const defaultPrefs: NotificationPref[] = [
  { id: 'retention_alert', label: 'Retention Alerts', description: 'Upcoming retention deadlines (90, 30, 7 days)', email: true, inApp: true },
  { id: 'overdue_notice', label: 'Overdue Notices', description: 'Records not returned by due date', email: true, inApp: true },
  { id: 'disposition_approval', label: 'Disposition Approvals', description: 'Disposition requests requiring your approval', email: true, inApp: true },
  { id: 'transmittal_status', label: 'Transmittal Updates', description: 'Status changes on your transmittals', email: false, inApp: true },
  { id: 'classification_complete', label: 'AI Classification', description: 'Records classified by AI ready for review', email: false, inApp: true },
  { id: 'system_maintenance', label: 'System Maintenance', description: 'Scheduled maintenance and downtime notices', email: true, inApp: true },
];

const STORAGE_PREFIX = 'maine-rms:notification-prefs';

function storageKey(userId?: string): string {
  return userId ? `${STORAGE_PREFIX}:${userId}` : STORAGE_PREFIX;
}

function loadStoredPrefs(userId?: string): NotificationPref[] | null {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, { email: boolean; inApp: boolean }>;
    return defaultPrefs.map((p) => {
      const stored = parsed[p.id];
      if (!stored) return p;
      return { ...p, email: !!stored.email, inApp: !!stored.inApp };
    });
  } catch {
    return null;
  }
}

function persistPrefs(prefs: NotificationPref[], userId?: string): void {
  const compact: Record<string, { email: boolean; inApp: boolean }> = {};
  for (const p of prefs) compact[p.id] = { email: p.email, inApp: p.inApp };
  localStorage.setItem(storageKey(userId), JSON.stringify(compact));
}

export function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<NotificationPref[]>(defaultPrefs);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = loadStoredPrefs(user?.id);
    if (stored) setPrefs(stored);
  }, [user?.id]);

  function togglePref(id: string, channel: 'email' | 'inApp') {
    setPrefs((prev) => prev.map((p) => p.id === id ? { ...p, [channel]: !p[channel] } : p));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      persistPrefs(prefs, user?.id);
      setDirty(false);
      toast('Notification preferences saved.', 'success');
    } catch {
      toast('Could not save preferences. Storage may be unavailable.', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setPrefs(defaultPrefs);
    setDirty(true);
  }

  return (
    <div data-testid="notifications-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Notification Preferences</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configure how you receive alerts and updates</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="h-9 px-3 border border-slate-300 text-slate-600 rounded text-sm font-medium hover:bg-slate-50 transition-colors"
            data-testid="reset-prefs-button"
          >
            Reset to defaults
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="h-9 px-3 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            data-testid="save-prefs-button"
          >
            {saving ? 'Saving...' : dirty ? 'Save Preferences' : 'No changes'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-6">
          <span className="flex-1 text-sm font-semibold text-slate-800">Notification Type</span>
          <span className="w-20 text-center text-xs font-medium text-slate-500 uppercase flex items-center justify-center gap-1">
            <EnvelopeIcon className="w-3.5 h-3.5" /> Email
          </span>
          <span className="w-20 text-center text-xs font-medium text-slate-500 uppercase flex items-center justify-center gap-1">
            <BellIcon className="w-3.5 h-3.5" /> In-App
          </span>
        </div>
        <div className="divide-y divide-slate-100">
          {prefs.map((pref) => (
            <div key={pref.id} className="px-4 py-3 flex items-center gap-6" data-testid={`pref-${pref.id}`}>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">{pref.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{pref.description}</p>
              </div>
              <div className="w-20 flex justify-center">
                <button
                  onClick={() => togglePref(pref.id, 'email')}
                  className={`w-9 h-5 rounded-full transition-colors relative ${pref.email ? 'bg-navy-500' : 'bg-slate-200'}`}
                  aria-label={`${pref.label} email ${pref.email ? 'enabled' : 'disabled'}`}
                  aria-pressed={pref.email}
                  data-testid={`toggle-${pref.id}-email`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${pref.email ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="w-20 flex justify-center">
                <button
                  onClick={() => togglePref(pref.id, 'inApp')}
                  className={`w-9 h-5 rounded-full transition-colors relative ${pref.inApp ? 'bg-navy-500' : 'bg-slate-200'}`}
                  aria-label={`${pref.label} in-app ${pref.inApp ? 'enabled' : 'disabled'}`}
                  aria-pressed={pref.inApp}
                  data-testid={`toggle-${pref.id}-inApp`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${pref.inApp ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 bg-white border border-slate-200 rounded-md p-4">
        <div className="flex items-start gap-3">
          <DevicePhoneMobileIcon className="w-5 h-5 text-slate-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-800">SMS Notifications</p>
            <p className="text-xs text-slate-500 mt-0.5">SMS alerts for critical notifications available after Active Directory integration is configured.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
