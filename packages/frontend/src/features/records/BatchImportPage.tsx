import { useState, useRef, useMemo } from 'react';
import { ArrowUpTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { DataTable } from '../../components/DataTable';
import { useApiMutation } from '../../hooks/useApi';

const TARGET_FIELDS = [
  { key: 'title', label: 'Title', required: true, hint: 'Record title' },
  { key: 'series', label: 'Series', required: false, hint: 'Series title / RDA code' },
  { key: 'agency', label: 'Agency', required: false, hint: 'Agency name or code' },
  { key: 'description', label: 'Description', required: false, hint: 'Free-text description' },
  { key: 'containerNumber', label: 'Container #', required: false, hint: 'Box / container barcode' },
  { key: 'trNumber', label: 'Transmittal #', required: false, hint: 'Legacy transmittal number' },
  { key: 'umbrella', label: 'Umbrella', required: false, hint: 'Top-level org grouping' },
  { key: 'unit', label: 'Unit', required: false, hint: 'Org unit' },
  { key: 'subunit', label: 'Subunit', required: false, hint: 'Org subunit' },
] as const;

type FieldKey = typeof TARGET_FIELDS[number]['key'];

interface ImportRow {
  row: number;
  values: Partial<Record<FieldKey, string>>;
  valid: boolean;
  error?: string;
}

function autoMatch(headers: string[]): Record<FieldKey, string> {
  const mapping: Partial<Record<FieldKey, string>> = {};
  for (const field of TARGET_FIELDS) {
    const exact = headers.find((h) => h.toLowerCase().replace(/[\s_-]+/g, '') === field.key.toLowerCase());
    if (exact) { mapping[field.key] = exact; continue; }
    const labelMatch = headers.find((h) => h.toLowerCase().includes(field.label.toLowerCase().split(' ')[0]));
    if (labelMatch) mapping[field.key] = labelMatch;
  }
  return mapping as Record<FieldKey, string>;
}

function parseCSV(text: string): { headers: string[]; data: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], data: [] };
  const headers = lines[0].split(',').map((c) => c.trim());
  const data = lines.slice(1).map((line) => line.split(',').map((c) => c.trim()));
  return { headers, data };
}

export function BatchImportPage() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Partial<Record<FieldKey, string>>>({});
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const mutation = useApiMutation<{ imported: number }, { rows: any[] }>('/records/batch-import', 'post');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const { headers: hdrs, data } = parseCSV(text);
      setHeaders(hdrs);
      setRawRows(data);
      setMapping(autoMatch(hdrs));
    };
    reader.readAsText(file);
  }

  const rows: ImportRow[] = useMemo(() => {
    if (rawRows.length === 0) return [];
    return rawRows.map((cols, idx) => {
      const values: Partial<Record<FieldKey, string>> = {};
      for (const field of TARGET_FIELDS) {
        const sourceCol = mapping[field.key];
        if (!sourceCol) continue;
        const colIdx = headers.indexOf(sourceCol);
        if (colIdx >= 0) values[field.key] = cols[colIdx] ?? '';
      }
      const titleOk = (values.title || '').trim().length > 0;
      return {
        row: idx + 2,
        values,
        valid: titleOk,
        error: titleOk ? undefined : 'Missing required: Title',
      };
    });
  }, [rawRows, headers, mapping]);

  const validRows = rows.filter((r) => r.valid);
  const invalidRows = rows.filter((r) => !r.valid);

  const previewColumns = TARGET_FIELDS
    .filter((f) => mapping[f.key])
    .map((f) => ({
      key: f.key,
      label: f.label,
      render: (r: ImportRow) => <span className="text-sm text-slate-700">{r.values[f.key] || '—'}</span>,
    }));

  const tableColumns = [
    { key: 'row', label: 'Row', render: (r: ImportRow) => <span className="text-xs text-slate-400 font-mono">{r.row}</span> },
    ...previewColumns,
    {
      key: 'valid',
      label: 'Status',
      render: (r: ImportRow) => r.valid
        ? <span className="text-green-600 text-xs font-medium">Valid</span>
        : <span className="text-red-600 text-xs font-medium">{r.error}</span>,
    },
  ];

  function handleImport() {
    const payload = validRows.map((r) => ({
      title: r.values.title,
      series: r.values.series,
      agency: r.values.agency,
      description: r.values.description,
      containerNumber: r.values.containerNumber,
      trNumber: r.values.trNumber,
      umbrella: r.values.umbrella,
      unit: r.values.unit,
      subunit: r.values.subunit,
    }));
    mutation.mutate({ rows: payload });
  }

  return (
    <div data-testid="batch-import-page">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Batch Import Records</h1>
        <p className="text-sm text-slate-500 mt-0.5">Upload a CSV and map each column to a record field</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-md p-6 mb-6">
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
        <p className="text-xs text-slate-500 mt-2">First row must contain column headers. Mapping is auto-suggested and editable below.</p>
      </div>

      {headers.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-md p-5 mb-6" data-testid="column-mapping">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-800">Map Columns to Fields</h2>
            <span className="text-[11px] text-slate-400">{headers.length} CSV columns detected</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TARGET_FIELDS.map((field) => {
              const selected = mapping[field.key] || '';
              return (
                <div key={field.key} className="flex items-center gap-3">
                  <label className="w-40 flex-shrink-0">
                    <span className="block text-sm font-medium text-slate-700">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-0.5">*</span>}
                    </span>
                    <span className="block text-[11px] text-slate-400">{field.hint}</span>
                  </label>
                  <select
                    value={selected}
                    onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value || undefined })}
                    className="flex-1 h-9 px-2 border border-slate-200 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-500"
                    data-testid={`mapping-${field.key}`}
                  >
                    <option value="">— Skip —</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  {selected && <CheckCircleIcon className="w-4 h-4 text-emerald-500" />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-slate-700">{validRows.length} valid rows</span>
            {invalidRows.length > 0 && (
              <span className="text-sm text-red-600">{invalidRows.length} errors</span>
            )}
          </div>
          <DataTable columns={tableColumns} data={rows} keyExtractor={(r) => String(r.row)} />
          <div className="mt-4">
            <button
              onClick={handleImport}
              disabled={validRows.length === 0 || mutation.isPending}
              className="px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600 disabled:opacity-50"
              data-testid="import-submit-button"
            >
              {mutation.isPending ? 'Importing...' : `Import ${validRows.length} Records`}
            </button>
            {mutation.isSuccess && (
              <span className="ml-3 text-sm text-emerald-600 font-medium">
                Imported {mutation.data?.imported ?? validRows.length} records.
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
