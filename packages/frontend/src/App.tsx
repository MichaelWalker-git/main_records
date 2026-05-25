import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './features/auth/LoginPage';
import { RecordsListPage } from './features/records/RecordsListPage';
import { RecordDetailPage } from './features/records/RecordDetailPage';
import { CreateRecordPage } from './features/records/CreateRecordPage';
import { BatchImportPage } from './features/records/BatchImportPage';
import { TransmittalsListPage } from './features/transmittals/TransmittalsListPage';
import { SubmitTransmittalPage } from './features/transmittals/SubmitTransmittalPage';
import { TransmittalDetailPage } from './features/transmittals/TransmittalDetailPage';
import { DispositionsListPage } from './features/dispositions/DispositionsListPage';
import { DispositionDetailPage } from './features/dispositions/DispositionDetailPage';
import { LegalHoldsPage } from './features/dispositions/LegalHoldsPage';
import { InventoryPage } from './features/inventory/InventoryPage';
import { BarcodeScanPage } from './features/inventory/BarcodeScanPage';
import { UtilizationPage } from './features/inventory/UtilizationPage';
import { SearchPage } from './features/search/SearchPage';
import { DashboardPage } from './features/analytics/DashboardPage';
import { ReportsPage } from './features/analytics/ReportsPage';
import { UsersPage } from './features/admin/UsersPage';
import { RetentionSchedulesPage } from './features/admin/RetentionSchedulesPage';
import { AuditLogPage } from './features/admin/AuditLogPage';
import { IntegrationsPage } from './features/admin/IntegrationsPage';
import { AgencyDashboardPage } from './features/agency-portal/AgencyDashboardPage';
import { SubmitAccessionPage } from './features/agency-portal/SubmitAccessionPage';
import { ReferenceRequestPage } from './features/agency-portal/ReferenceRequestPage';
import { LoadingSpinner } from './components/LoadingSpinner';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RoleRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { roles } = useAuth();
  const hasAccess = allowedRoles.some((r) => roles.includes(r as never));

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/records" element={<RecordsListPage />} />
          <Route path="/records/new" element={<CreateRecordPage />} />
          <Route path="/records/import" element={<BatchImportPage />} />
          <Route path="/records/:id" element={<RecordDetailPage />} />
          <Route path="/transmittals" element={<TransmittalsListPage />} />
          <Route path="/transmittals/new" element={<SubmitTransmittalPage />} />
          <Route path="/transmittals/:id" element={<TransmittalDetailPage />} />
          <Route path="/dispositions" element={<DispositionsListPage />} />
          <Route path="/dispositions/legal-holds" element={<LegalHoldsPage />} />
          <Route path="/dispositions/:id" element={<DispositionDetailPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/inventory/scan" element={<BarcodeScanPage />} />
          <Route path="/inventory/utilization" element={<UtilizationPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/analytics" element={<DashboardPage />} />
          <Route path="/analytics/reports" element={<ReportsPage />} />
          <Route path="/admin" element={<RoleRoute allowedRoles={['admin']}><UsersPage /></RoleRoute>} />
          <Route path="/admin/users" element={<RoleRoute allowedRoles={['admin']}><UsersPage /></RoleRoute>} />
          <Route path="/admin/retention" element={<RoleRoute allowedRoles={['admin', 'staff']}><RetentionSchedulesPage /></RoleRoute>} />
          <Route path="/admin/audit" element={<RoleRoute allowedRoles={['admin']}><AuditLogPage /></RoleRoute>} />
          <Route path="/admin/integrations" element={<RoleRoute allowedRoles={['admin']}><IntegrationsPage /></RoleRoute>} />
          <Route path="/agency" element={<RoleRoute allowedRoles={['agency_user', 'admin']}><AgencyDashboardPage /></RoleRoute>} />
          <Route path="/agency/accession" element={<RoleRoute allowedRoles={['agency_user', 'admin']}><SubmitAccessionPage /></RoleRoute>} />
          <Route path="/agency/reference" element={<RoleRoute allowedRoles={['agency_user', 'admin']}><ReferenceRequestPage /></RoleRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
