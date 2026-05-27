import { useState } from 'react';
import {
  DocumentArrowDownIcon,
  ShieldCheckIcon,
  CogIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { ExportButton } from '../../components/ExportButton';
import { useToast } from '../../components/Toast';
import { exportReport } from '../../utils/export';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const reportTemplates: ReportTemplate[] = [
  { id: 'retention-compliance', name: 'Retention Compliance', description: 'Records approaching or past retention deadlines', category: 'Compliance', icon: ShieldCheckIcon },
  { id: 'disposition-summary', name: 'Disposition Summary', description: 'Summary of all disposition actions by period', category: 'Operations', icon: DocumentArrowDownIcon },
  { id: 'agency-activity', name: 'Agency Activity', description: 'Transfer and accession activity by agency', category: 'Operations', icon: CogIcon },
  { id: 'inventory-status', name: 'Inventory Status', description: 'Current warehouse utilization and capacity', category: 'Inventory', icon: ArchiveBoxIcon },
  { id: 'audit-trail', name: 'Audit Trail', description: 'Complete audit trail for selected time period', category: 'Compliance', icon: ShieldCheckIcon },
  { id: 'legal-holds', name: 'Legal Holds Report', description: 'Active and historical legal holds', category: 'Compliance', icon: ShieldCheckIcon },
];

const CATEGORY_COLORS: Record<string, string> = {
  Compliance: 'text-purple-600 bg-purple-50 border-purple-200',
  Operations: 'text-blue-600 bg-blue-50 border-blue-200',
  Inventory: 'text-green-600 bg-green-50 border-green-200',
};

export function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const selected = reportTemplates.find((r) => r.id === selectedReport);

  async function handleGenerate(format: 'pdf' | 'excel' | 'csv') {
    if (!selectedReport) return;
    setIsGenerating(true);
    try {
      await exportReport(selectedReport, format);
    } catch {
      toast('Failed to generate report export', 'error');
    } finally {
      setIsGenerating(false);
    }
  }

  const categories = [...new Set(reportTemplates.map((r) => r.category))];

  return (
    <div data-testid="reports-page">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Generate and export system reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Templates */}
        <div className="lg:col-span-2 space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[11px] uppercase tracking-wide font-medium px-2 py-0.5 rounded border ${CATEGORY_COLORS[category] || 'text-slate-600 bg-slate-50 border-slate-200'}`}>
                  {category}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reportTemplates
                  .filter((r) => r.category === category)
                  .map((report) => {
                    const isSelected = selectedReport === report.id;
                    const Icon = report.icon;
                    return (
                      <button
                        key={report.id}
                        onClick={() => setSelectedReport(report.id)}
                        className={`relative text-left p-4 rounded-md border transition-all ${
                          isSelected
                            ? 'border-navy-500 bg-navy-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                        data-testid={`report-template-${report.id}`}
                      >
                        {isSelected && (
                          <CheckCircleIcon className="absolute top-3 right-3 w-5 h-5 text-navy-500" />
                        )}
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-navy-100' : 'bg-slate-100'}`}>
                            <Icon className={`w-4.5 h-4.5 ${isSelected ? 'text-navy-600' : 'text-slate-500'}`} />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-medium ${isSelected ? 'text-navy-700' : 'text-slate-800'}`}>{report.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{report.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Generate Panel */}
        <div>
          <div className="bg-white border border-slate-200 rounded-md sticky top-6">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Generate Report</h3>
              {selected && (
                <p className="text-xs text-slate-500 mt-0.5">{selected.name}</p>
              )}
            </div>
            <div className="p-5">
              {selected ? (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">{selected.description}</p>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                      data-testid="report-date-from"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                      data-testid="report-date-to"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-2">Export Format</p>
                    <ExportButton onExport={handleGenerate} isLoading={isGenerating} />
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <DocumentArrowDownIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-500">Select a report template</p>
                  <p className="text-xs text-slate-400 mt-1">Choose from the list to configure and generate</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}