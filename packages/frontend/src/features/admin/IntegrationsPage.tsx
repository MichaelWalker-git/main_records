import { CheckCircleIcon, XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'syncing';
  lastSync?: string;
}

const integrations: Integration[] = [
  { id: 'archivesspace', name: 'ArchivesSpace', description: 'Archival management system integration for finding aids and collections', status: 'connected', lastSync: '2026-05-24T10:30:00Z' },
  { id: 'crm', name: 'CRM System', description: 'Customer relationship management for agency contacts and service requests', status: 'connected', lastSync: '2026-05-24T09:15:00Z' },
  { id: 'm365', name: 'Microsoft 365', description: 'SharePoint and OneDrive integration for electronic records capture', status: 'disconnected' },
  { id: 'ad', name: 'Active Directory', description: 'State of Maine AD for user provisioning and SAML authentication', status: 'connected', lastSync: '2026-05-24T11:00:00Z' },
];

function StatusIcon({ status }: { status: Integration['status'] }) {
  switch (status) {
    case 'connected':
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case 'disconnected':
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    case 'syncing':
      return <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />;
  }
}

export function IntegrationsPage() {
  return (
    <div data-testid="integrations-page">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Integrations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="bg-white border border-slate-200 rounded-lg p-6"
            data-testid={`integration-card-${integration.id}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-800">{integration.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{integration.description}</p>
              </div>
              <StatusIcon status={integration.status} />
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium capitalize ${
                  integration.status === 'connected' ? 'text-green-600' :
                  integration.status === 'disconnected' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {integration.status}
                </span>
                {integration.lastSync && (
                  <span className="text-xs text-slate-400">
                    Last sync: {new Date(integration.lastSync).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <button
                className="text-xs text-navy-500 hover:text-navy-600 font-medium"
                data-testid={`configure-${integration.id}`}
              >
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
