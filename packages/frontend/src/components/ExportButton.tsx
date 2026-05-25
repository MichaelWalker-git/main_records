import { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface ExportButtonProps {
  onExport: (format: 'pdf' | 'excel' | 'csv') => void;
  isLoading?: boolean;
}

export function ExportButton({ onExport, isLoading }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formats: { key: 'pdf' | 'excel' | 'csv'; label: string }[] = [
    { key: 'pdf', label: 'Export as PDF' },
    { key: 'excel', label: 'Export as Excel' },
    { key: 'csv', label: 'Export as CSV' },
  ];

  return (
    <div className="relative" data-testid="export-button">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
        data-testid="export-trigger"
      >
        <ArrowDownTrayIcon className="w-4 h-4" aria-hidden="true" />
        Export
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-md shadow-lg border border-slate-200 z-20">
          {formats.map((format) => (
            <button
              key={format.key}
              onClick={() => {
                onExport(format.key);
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              data-testid={`export-${format.key}`}
            >
              {format.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
