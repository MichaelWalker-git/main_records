import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { BarcodeScanner } from '../../components/BarcodeScanner';
import { RecordCard } from '../../components/RecordCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { useApiMutation } from '../../hooks/useApi';
import { RMSRecord as Record } from '../../types';

interface ScanResult {
  record?: Record;
  action?: string;
  message: string;
}

export function BarcodeScanPage() {
  const [lastScanned, setLastScanned] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);

  const scanMutation = useApiMutation<ScanResult, { barcode: string }>('/inventory/scan', 'post', {
    onSuccess: (data) => setResult(data),
  });

  function handleScan(code: string) {
    setLastScanned(code);
    setResult(null);
    scanMutation.mutate({ barcode: code });
  }

  return (
    <div data-testid="barcode-scan-page">
      <Link to="/inventory/circulation" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeftIcon className="w-3.5 h-3.5" />
        Back to Circulation
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Barcode Scan</h1>
        <p className="text-sm text-slate-500 mt-0.5">Scan a barcode to look up a record and see available actions</p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Scanning looks up the record by its tracking number or container barcode. Once found, you can see the record's current status and whether it is available for checkout or ready for return.
          </p>
        </div>

        <BarcodeScanner onScan={handleScan} />

        <div className="bg-white border border-slate-200 rounded-md p-4">
          <label htmlFor="manual-barcode" className="block text-sm font-medium text-slate-700 mb-1">
            Manual Entry
          </label>
          <div className="flex gap-2">
            <input
              id="manual-barcode"
              type="text"
              value={lastScanned}
              onChange={(e) => setLastScanned(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="Enter barcode or tracking number..."
              data-testid="manual-barcode-input"
            />
            <button
              onClick={() => handleScan(lastScanned)}
              disabled={!lastScanned || scanMutation.isPending}
              className="px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600 disabled:opacity-50"
              data-testid="manual-scan-button"
            >
              Lookup
            </button>
          </div>
        </div>

        {scanMutation.isPending && (
          <div className="flex justify-center"><LoadingSpinner size="md" /></div>
        )}

        {result && (
          <div className="space-y-3" data-testid="scan-result">
            {result.record ? (
              <div className="bg-white border border-slate-200 rounded-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-800">Record Found</h3>
                  <StatusBadge status={result.record.status} />
                </div>
                <RecordCard record={result.record} />
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-medium mb-2">Available Action</p>
                  {result.action === 'checkout_available' && (
                    <div className="flex items-center gap-2 text-sm text-navy-700 bg-navy-50 border border-navy-200 rounded p-2">
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span>Record is in storage — available for check-out</span>
                    </div>
                  )}
                  {result.action === 'checkin_available' && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">
                      <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                      <span>Record is checked out — ready for return</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-md bg-yellow-50 border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800">{result.message}</p>
                <p className="text-xs text-yellow-600 mt-1">Try a different barcode or tracking number.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
