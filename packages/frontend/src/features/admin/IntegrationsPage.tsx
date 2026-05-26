import { useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon, SignalIcon } from '@heroicons/react/24/outline';
import { useApiQuery, useApiMutation } from '../../hooks/useApi';

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'configured' | 'syncing';
  lastSync?: string | null;
  health: { responseTimeMs: number; uptimePercent: number };
}

interface TestResult {
  testResult: 'success' | 'failure' | 'pending';
  message: string;
  testedAt: string;
}

function StatusIcon({ status }: { status: Integration['status'] }) {
  switch (status) {
    case 'connected':
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case 'disconnected':
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    case 'syncing':
      return <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />;
    case 'configured':
      return <SignalIcon className="w-5 h-5 text-amber-500" />;
  }
}

function HealthBar({ percent }: { percent: number }) {
  const color = percent >= 99.5 ? 'bg-green-500' : percent >= 95 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs text-slate-500">{percent}%</span>
    </div>
  );
}

export function IntegrationsPage() {
  const { data: integrations = [] } = useApiQuery<Integration[]>(['integrations'], '/integrations');
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [testingId, setTestingId] = useState<string | null>(null);

  const testMutation = useApiMutation<TestResult, void>(`/integrations/${testingId}/test`, 'post', {
    onSuccess: (data) => {
      if (testingId) {
        setTestResults((prev) => ({ ...prev, [testingId]: data }));
      }
      setTestingId(null);
    },
    onError: () => setTestingId(null),
  });

  function handleTest(id: string) {
    setTestingId(id);
    testMutation.mutate();
  }

  return (
    <div data-testid="integrations-page">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Integrations</h1>
        <p className="text-sm text-slate-500 mt-0.5">External system connections and health monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => {
          const result = testResults[integration.id];
          return (
            <div
              key={integration.id}
              className="bg-white border border-slate-200 rounded-md p-5"
              data-testid={`integration-card-${integration.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-800">{integration.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{integration.description}</p>
                </div>
                <StatusIcon status={integration.status} />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium capitalize ${
                    integration.status === 'connected' ? 'text-green-600' :
                    integration.status === 'disconnected' ? 'text-red-600' :
                    integration.status === 'configured' ? 'text-amber-600' : 'text-blue-600'
                  }`}>
                    {integration.status}
                  </span>
                  {integration.lastSync && (
                    <span className="text-xs text-slate-400">
                      Synced: {new Date(integration.lastSync).toLocaleTimeString()}
                    </span>
                  )}
                </div>

                {integration.health.uptimePercent > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400">Uptime:</span>
                      <HealthBar percent={integration.health.uptimePercent} />
                    </div>
                    <span className="text-[11px] text-slate-400">{integration.health.responseTimeMs}ms</span>
                  </div>
                )}

                {result && (
                  <div className={`text-xs px-2 py-1.5 rounded ${
                    result.testResult === 'success' ? 'bg-green-50 text-green-700' :
                    result.testResult === 'pending' ? 'bg-amber-50 text-amber-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {result.message}
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleTest(integration.id)}
                    disabled={testingId === integration.id}
                    className="text-xs text-navy-500 hover:text-navy-600 font-medium disabled:opacity-50"
                    data-testid={`test-${integration.id}`}
                  >
                    {testingId === integration.id ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}