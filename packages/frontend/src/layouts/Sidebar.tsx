import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
  TruckIcon,
  TrashIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  ArrowsRightLeftIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles?: string[];
  section?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: HomeIcon, section: 'main' },
  { label: 'Records', path: '/records', icon: DocumentTextIcon, section: 'main' },
  { label: 'Transmittals', path: '/transmittals', icon: TruckIcon, section: 'main' },
  { label: 'Dispositions', path: '/dispositions', icon: TrashIcon, roles: ['admin', 'staff', 'records_officer'], section: 'main' },
  { label: 'Inventory', path: '/inventory', icon: MapPinIcon, roles: ['admin', 'staff', 'records_officer'], section: 'operations' },
  { label: 'Circulation', path: '/inventory/circulation', icon: ArrowsRightLeftIcon, roles: ['admin', 'staff', 'records_officer'], section: 'operations' },
  { label: 'Search', path: '/search', icon: MagnifyingGlassIcon, section: 'operations' },
  { label: 'Analytics', path: '/analytics', icon: ChartBarIcon, section: 'operations' },
  { label: 'Reports', path: '/analytics/reports', icon: DocumentDuplicateIcon, roles: ['admin', 'staff', 'records_officer'], section: 'operations' },
  { label: 'Agency Portal', path: '/agency', icon: BuildingOfficeIcon, roles: ['agency_user', 'admin', 'staff'], section: 'admin' },
  { label: 'Notifications', path: '/admin/notifications', icon: BellIcon, section: 'admin' },
  { label: 'Templates', path: '/admin/templates', icon: DocumentDuplicateIcon, roles: ['admin', 'staff'], section: 'admin' },
  { label: 'Administration', path: '/admin', icon: Cog6ToothIcon, roles: ['admin'], section: 'admin' },
];

export function Sidebar() {
  const { roles } = useAuth();

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.some((r) => roles.includes(r as never))
  );

  const mainItems = visibleItems.filter((i) => i.section === 'main');
  const opsItems = visibleItems.filter((i) => i.section === 'operations');
  const adminItems = visibleItems.filter((i) => i.section === 'admin');

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${
      isActive
        ? 'bg-navy-400 text-white'
        : 'text-navy-100 hover:bg-navy-400/50 hover:text-white'
    }`;

  return (
    <aside className="w-64 bg-navy-500 min-h-screen flex flex-col" role="complementary" aria-label="Application sidebar" data-testid="sidebar">
      <div className="px-5 py-4 border-b border-navy-400/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21" />
            </svg>
          </div>
          <div>
            <h1 className="text-white text-sm font-bold leading-tight">Maine RMS</h1>
            <p className="text-navy-300 text-[11px]">Records Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto" aria-label="Main navigation">
        <div className="space-y-0.5">
          {mainItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={linkClass}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </div>

        {opsItems.length > 0 && (
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-navy-300">
              Operations
            </p>
            <div className="space-y-0.5">
              {opsItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={linkClass}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" aria-hidden="true" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {adminItems.length > 0 && (
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-navy-300">
              System
            </p>
            <div className="space-y-0.5">
              {adminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={linkClass}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" aria-hidden="true" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="px-4 py-3 border-t border-navy-400/50">
        <p className="text-navy-400 text-[10px]">v1.0.0 — Horus Technology</p>
      </div>
    </aside>
  );
}