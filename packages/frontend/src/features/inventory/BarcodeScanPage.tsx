import { useState } from 'react';
import { BarcodeScanner } from '../../components/BarcodeScanner';
import { RecordCard } from '../../components/RecordCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
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
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Barcode Scan</h1>
        <p className="text-sm text-slate-500 mt-0.5">Scan or enter a barcode to locate records</p>
      </div>
      <div className="max-w-xl mx-auto space-y-6">
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
              placeholder="Enter barcode..."
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
            <div className={`p-4 rounded-md ${result.record ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className="text-sm font-medium">{result.message}</p>
              {result.action && <p className="text-xs text-slate-500 mt-1">Action: {result.action}</p>}
            </div>
            {result.record && <RecordCard record={result.record} />}
          </div>
        )}
      </div>
    </div>
  );
}
