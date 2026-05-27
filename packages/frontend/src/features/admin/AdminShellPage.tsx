import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs } from '../../components/Tabs';
import { useAuth } from '../../hooks/useAuth';
import { UsersPage } from './UsersPage';
import { RetentionSchedulesPage } from './RetentionSchedulesPage';
import { AuditLogPage } from './AuditLogPage';
import { IntegrationsPage } from './IntegrationsPage';
import { NotificationsPage } from './NotificationsPage';
import { TemplatesPage } from './TemplatesPage';

type AdminTab = 'users' | 'templates' | 'retention' | 'integrations' | 'notifications' | 'audit';

const VALID_TABS: AdminTab[] = ['users', 'templates', 'retention', 'integrations', 'notifications', 'audit'];

function tabFromPath(pathname: string): AdminTab {
  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1];
  if (last === 'retention-schedules') return 'retention';
  if (VALID_TABS.includes(last as AdminTab)) return last as AdminTab;
  return 'users';
}

export function AdminShellPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();

  const activeTab = tabFromPath(location.pathname);

  const tabs = [
    { key: 'users', label: 'Users' },
    { key: 'templates', label: 'Templates' },
    { key: 'retention', label: 'Retention' },
    { key: 'integrations', label: 'Integrations' },
    { key: 'notifications', label: 'Notifications' },
    ...(isAdmin ? [{ key: 'audit', label: 'Audit Log' }] : []),
  ];

  function renderTab() {
    switch (activeTab) {
      case 'users': return <UsersPage />;
      case 'templates': return <TemplatesPage />;
      case 'retention': return <RetentionSchedulesPage />;
      case 'integrations': return <IntegrationsPage />;
      case 'notifications': return <NotificationsPage />;
      case 'audit': return <AuditLogPage />;
      default: return <UsersPage />;
    }
  }

  return (
    <div data-testid="admin-shell-page">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-800">Administration</h1>
        <p className="text-sm text-slate-500 mt-0.5">System configuration and oversight</p>
      </div>

      <Tabs
        tabs={tabs}
        activeKey={activeTab}
        onChange={(key) => navigate(`/admin/${key}`)}
        className="mb-6"
        testIdPrefix="admin-tab"
      />

      <div>{renderTab()}</div>
    </div>
  );
}
