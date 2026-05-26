import { useState } from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { ExportButton } from '../../components/ExportButton';
import { useApiMutation } from '../../hooks/useApi';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
}

const reportTemplates: ReportTemplate[] = [
  { id: 'retention-compliance', name: 'Retention Compliance', description: 'Records approaching or past retention deadlines', category: 'Compliance' },
  { id: 'disposition-summary', name: 'Disposition Summary', description: 'Summary of all disposition actions by period', category: 'Operations' },
  { id: 'agency-activity', name: 'Agency Activity', description: 'Transfer and accession activity by agency', category: 'Operations' },
  { id: 'inventory-status', name: 'Inventory Status', description: 'Current warehouse utilization and capacity', category: 'Inventory' },
  { id: 'audit-trail', name: 'Audit Trail', description: 'Complete audit trail for selected time period', category: 'Compliance' },
  { id: 'legal-holds', name: 'Legal Holds Report', description: 'Active and historical legal holds', category: 'Compliance' },
];

export function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const generateMutation = useApiMutation<{ url: string }, object>('/reports/generate', 'post');

  function handleGenerate(format: 'pdf' | 'excel' | 'csv') {
    if (!selectedReport) return;
    generateMutation.mutate({ reportId: selectedReport, format, dateFrom, dateTo });
  }

  const categories = [...new Set(reportTemplates.map((r) => r.category))];

  return (
    <div data-testid="reports-page">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Generate and export system reports</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {categories.map((category) => (
            <div key={category} className="mb-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase mb-3">{category}</h2>
              <div className="space-y-2">
                {reportTemplates
                  .filter((r) => r.category === category)
                  .map((report) => (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        selectedReport === report.id
                          ? 'border-navy-500 bg-navy-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                      data-testid={`report-template-${report.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <DocumentArrowDownIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{report.name}</p>
                          <p className="text-xs text-slate-500">{report.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="bg-white border border-slate-200 rounded-lg p-6 sticky top-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Generate Report</h3>
            {selectedReport ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">From Date</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    data-testid="report-date-from"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">To Date</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    data-testid="report-date-to"
                  />
                </div>
                <ExportButton onExport={handleGenerate} isLoading={generateMutation.isPending} />
              </div>
            ) : (
              <p className="text-sm text-slate-500">Select a report template to generate.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
