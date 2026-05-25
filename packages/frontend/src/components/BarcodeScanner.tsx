import { useEffect, useRef, useCallback } from 'react';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  enabled?: boolean;
}

export function BarcodeScanner({ onScan, enabled = true }: BarcodeScannerProps) {
  const bufferRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastKeyTimeRef = useRef(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const now = Date.now();
      const timeSinceLast = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (timeSinceLast > 50) {
        bufferRef.current = '';
      }

      if (e.key === 'Enter') {
        if (bufferRef.current.length >= 4) {
          onScan(bufferRef.current);
        }
        bufferRef.current = '';
        return;
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        bufferRef.current = '';
      }, 100);
    },
    [onScan, enabled]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [handleKeyDown]);

  return (
    <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center" data-testid="barcode-scanner">
      <div className="text-slate-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 4.5h3m-3 0v3m0-3h.375M7.5 4.5v3m9.75-3h3m-3 0v3m3-3v.375M3.75 19.5h3m-3 0v-3m0 3h.375m3.375 0v-3m9.75 3h3m-3 0v-3m3 3v-.375M4.5 7.5h1.5v1.5H4.5V7.5zm0 9h1.5v1.5H4.5v-1.5zm13.5-9H19.5v1.5H18V7.5z" />
        </svg>
        <p className="text-sm font-medium">Ready to Scan</p>
        <p className="text-xs mt-1">Scan a barcode with the USB scanner or enter code manually</p>
      </div>
    </div>
  );
}
