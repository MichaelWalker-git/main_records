import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  DocumentTextIcon,
  TruckIcon,
  TrashIcon,
  MapPinIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowsRightLeftIcon,
  DocumentDuplicateIcon,
  InboxArrowDownIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles?: string[];
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', path: '/', icon: HomeIcon },
      { label: 'Search', path: '/search', icon: MagnifyingGlassIcon },
    ],
  },
  {
    title: 'Intake',
    items: [
      { label: 'Records', path: '/records', icon: DocumentTextIcon },
      { label: 'Transmittals', path: '/transmittals', icon: InboxArrowDownIcon },
    ],
  },
  {
    title: 'Storage',
    items: [
      { label: 'Inventory', path: '/inventory', icon: MapPinIcon, roles: ['admin', 'staff', 'records_officer'] },
      { label: 'Circulation', path: '/inventory/circulation', icon: ArrowsRightLeftIcon, roles: ['admin', 'staff', 'records_officer'] },
    ],
  },
  {
    title: 'Lifecycle',
    items: [
      { label: 'Dispositions', path: '/dispositions', icon: TrashIcon, roles: ['admin', 'staff', 'records_officer'] },
      { label: 'Retention', path: '/admin/retention-schedules', icon: ShieldCheckIcon, roles: ['admin', 'staff'] },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Analytics', path: '/analytics', icon: ChartBarIcon },
      { label: 'Reports', path: '/analytics/reports', icon: DocumentDuplicateIcon, roles: ['admin', 'staff', 'records_officer'] },
    ],
  },
  {
    title: 'Admin',
    items: [
      { label: 'Administration', path: '/admin', icon: Cog6ToothIcon, roles: ['admin'] },
    ],
  },
];

export function Sidebar() {
  const { roles } = useAuth();

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

      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto" aria-label="Main navigation">
        {sections.map((section, si) => {
          const visibleItems = section.items.filter(
            (item) => !item.roles || item.roles.some((r) => roles.includes(r as never))
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={si}>
              {section.title && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-navy-300">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
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
            </div>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-navy-400/50">
        <p className="text-navy-400 text-[10px]">v1.0.0 — Horus Technology</p>
      </div>
    </aside>
  );
}
