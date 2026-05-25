import { useState, useRef } from 'react';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { DataTable } from '../../components/DataTable';
import { useApiMutation } from '../../hooks/useApi';

interface ImportRow {
  row: number;
  title: string;
  series: string;
  agency: string;
  valid: boolean;
  error?: string;
}

export function BatchImportPage() {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const mutation = useApiMutation<{ imported: number }, { rows: ImportRow[] }>('/records/batch-import', 'post');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter(Boolean);
      const parsed = lines.slice(1).map((line, idx) => {
        const cols = line.split(',').map((c) => c.trim());
        const valid = cols.length >= 3 && cols[0].length > 0;
        return {
          row: idx + 2,
          title: cols[0] || '',
          series: cols[1] || '',
          agency: cols[2] || '',
          valid,
          error: valid ? undefined : 'Missing required fields',
        };
      });
      setRows(parsed);
    };
    reader.readAsText(file);
  }

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);

  const columns = [
    { key: 'row', label: 'Row' },
    { key: 'title', label: 'Title' },
    { key: 'series', label: 'Series' },
    { key: 'agency', label: 'Agency' },
    { key: 'valid', label: 'Status', render: (r: ImportRow) => (
      r.valid
        ? <span className="text-green-600 text-xs font-medium">Valid</span>
        : <span className="text-red-600 text-xs font-medium">{r.error}</span>
    )},
  ];

  return (
    <div data-testid="batch-import-page">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Batch Import Records</h1>
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            data-testid="file-input"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50"
            data-testid="upload-button"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            Upload CSV
          </button>
          {fileName && <span className="text-sm text-slate-600">{fileName}</span>}
        </div>
        <p className="text-xs text-slate-500 mt-2">Expected columns: Title, Series, Agency, Description (optional)</p>
      </div>

      {rows.length > 0 && (
        <>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-slate-700">{validRows.length} valid rows</span>
            {invalidRows.length > 0 && (
              <span className="text-sm text-red-600">{invalidRows.length} errors</span>
            )}
          </div>
          <DataTable columns={columns} data={rows} keyExtractor={(r) => String(r.row)} />
          <div className="mt-4">
            <button
              onClick={() => mutation.mutate({ rows: validRows })}
              disabled={validRows.length === 0 || mutation.isPending}
              className="px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600 disabled:opacity-50"
              data-testid="import-submit-button"
            >
              {mutation.isPending ? 'Importing...' : `Import ${validRows.length} Records`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
