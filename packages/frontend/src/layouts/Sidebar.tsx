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
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: HomeIcon },
  { label: 'Records', path: '/records', icon: DocumentTextIcon },
  { label: 'Transmittals', path: '/transmittals', icon: TruckIcon },
  { label: 'Dispositions', path: '/dispositions', icon: TrashIcon },
  { label: 'Inventory', path: '/inventory', icon: MapPinIcon },
  { label: 'Search', path: '/search', icon: MagnifyingGlassIcon },
  { label: 'Analytics', path: '/analytics', icon: ChartBarIcon },
  { label: 'Agency Portal', path: '/agency', icon: BuildingOfficeIcon, roles: ['agency_user', 'admin'] },
  { label: 'Administration', path: '/admin', icon: Cog6ToothIcon, roles: ['admin'] },
];

export function Sidebar() {
  const { roles } = useAuth();

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.some((r) => roles.includes(r as never))
  );

  return (
    <aside className="w-64 bg-navy-500 min-h-screen flex flex-col" data-testid="sidebar">
      <div className="px-6 py-5 border-b border-navy-400">
        <h1 className="text-white text-lg font-bold">Maine RMS</h1>
        <p className="text-navy-200 text-xs mt-1">Records Management System</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-navy-400 text-white'
                  : 'text-navy-100 hover:bg-navy-400 hover:text-white'
              }`
            }
            data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <item.icon className="w-5 h-5 mr-3 flex-shrink-0" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
