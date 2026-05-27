import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  QrCodeIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { useApiQuery, useApiMutation } from '../../hooks/useApi';
import { format, differenceInDays } from 'date-fns';

interface CirculationEvent {
  id: string;
  recordId: string;
  recordTitle?: string;
  userId: string;
  userName?: string;
  eventType: 'checkout' | 'checkin';
  checkedOutAt: string;
  dueDate: string;
  checkedInAt?: string;
  notes?: string;
  purpose?: string;
}

export function CirculationPage() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [recordId, setRecordId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [checkinRecordId, setCheckinRecordId] = useState('');
  const [checkinNotes, setCheckinNotes] = useState('');
  const [showCheckin, setShowCheckin] = useState(false);

  const { data: overdueData = [], refetch: refetchOverdue } = useApiQuery<CirculationEvent[]>(
    ['overdue'],
    '/inventory/overdue'
  );

  const checkoutMutation = useApiMutation<CirculationEvent, object>('/inventory/checkout', 'post', {
    onSuccess: () => {
      setShowCheckout(false);
      setRecordId('');
      setPurpose('');
      setDueDate('');
      setNotes('');
      refetchOverdue();
    },
  });

  const checkinMutation = useApiMutation<CirculationEvent, object>('/inventory/checkin', 'post', {
    onSuccess: () => {
      setShowCheckin(false);
      setCheckinRecordId('');
      setCheckinNotes('');
      refetchOverdue();
    },
  });

  const overdueColumns = [
    { key: 'recordId', label: 'Record', render: (e: any) => (
      <div className="min-w-0">
        <span className="font-medium text-slate-800 block truncate">{e.recordTitle || e.record_title || '—'}</span>
        <span className="text-[11px] text-slate-400 font-mono">{e.recordId?.slice(0, 8) || '—'}</span>
      </div>
    )},
    { key: 'userId', label: 'Held By', render: (e: any) => (
      <span className="text-sm text-slate-700">{e.userName || e.user_name || e.userId?.slice(0, 8) || '—'}</span>
    )},
    { key: 'purpose', label: 'Purpose', render: (e: any) => (
      <span className="text-sm text-slate-500 truncate block max-w-[150px]">{e.purpose || '—'}</span>
    )},
    { key: 'checkedOutAt', label: 'Checked Out', render: (e: CirculationEvent) => {
      const date = e.checkedOutAt || (e as any).checked_out_at;
      if (!date) return <span className="text-slate-400">—</span>;
      try { return <span className="text-sm">{format(new Date(date), 'MMM d, yyyy')}</span>; } catch { return <span>—</span>; }
    }},
    { key: 'dueDate', label: 'Due Date', render: (e: CirculationEvent) => {
      const date = e.dueDate || (e as any).due_date;
      if (!date) return <span className="text-slate-400">—</span>;
      try {
        const days = differenceInDays(new Date(), new Date(date));
        return (
          <div>
            <span className="text-red-600 font-medium text-sm">{format(new Date(date), 'MMM d, yyyy')}</span>
            <span className="text-[10px] text-red-500 block">{days} days overdue</span>
          </div>
        );
      } catch { return <span>—</span>; }
    }},
    { key: 'status', label: 'Status', render: () => (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-700 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
        <ExclamationTriangleIcon className="w-3 h-3" />
        Overdue
      </span>
    )},
    { key: 'actions', label: '', render: (e: CirculationEvent) => (
      <button
        onClick={() => { setCheckinRecordId(e.recordId || (e as any).record_id); setShowCheckin(true); }}
        className="text-sm text-navy-500 hover:underline font-medium"
      >
        Return
      </button>
    )},
  ];

  return (
    <div data-testid="circulation-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Circulation</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Temporary check-out and return of physical records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/inventory/scan"
            className="flex items-center gap-1.5 h-9 px-3 border border-slate-300 rounded text-sm font-medium hover:bg-slate-50 transition-colors text-slate-700"
          >
            <QrCodeIcon className="w-4 h-4" />
            Scan Barcode
          </Link>
          <button
            onClick={() => setShowCheckin(true)}
            className="flex items-center gap-1.5 h-9 px-3 border border-slate-300 rounded text-sm font-medium hover:bg-slate-50 transition-colors text-slate-700"
            data-testid="checkin-button"
          >
            <ArrowLeftOnRectangleIcon className="w-4 h-4" />
            Return Record
          </button>
          <button
            onClick={() => setShowCheckout(true)}
            className="flex items-center gap-1.5 h-9 px-3 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 transition-colors"
            data-testid="checkout-button"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Check Out Record
          </button>
        </div>
      </div>

      {/* Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-slate-200 rounded-md p-4 flex items-start gap-3">
          <ArrowRightOnRectangleIcon className="w-5 h-5 text-navy-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-800">Check Out</p>
            <p className="text-xs text-slate-500 mt-0.5">Remove a record from storage for temporary use. Requires purpose and return date.</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4 flex items-start gap-3">
          <ArrowLeftOnRectangleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-800">Return (Check In)</p>
            <p className="text-xs text-slate-500 mt-0.5">Return a checked-out record to Archives storage. Record becomes active again.</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-4 flex items-start gap-3">
          <QrCodeIcon className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-800">Barcode Scan</p>
            <p className="text-xs text-slate-500 mt-0.5">Scan a box/record barcode to look up its status and available actions.</p>
          </div>
        </div>
      </div>

      {/* Overdue Table */}
      <div className="bg-white border border-slate-200 rounded-md">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
          <h2 className="text-sm font-semibold text-slate-800">
            Overdue Items {overdueData.length > 0 && <span className="text-red-600">({overdueData.length})</span>}
          </h2>
        </div>
        {overdueData.length > 0 ? (
          <DataTable
            columns={overdueColumns}
            data={overdueData}
            keyExtractor={(e) => e.id}
          />
        ) : (
          <div className="px-4 py-8 text-center">
            <CheckCircleIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">All clear</p>
            <p className="text-xs text-slate-400 mt-0.5">No overdue items. All records returned on time.</p>
          </div>
        )}
      </div>

      {/* Check Out Modal */}
      <Modal isOpen={showCheckout} onClose={() => setShowCheckout(false)} title="Check Out Record">
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-md">
          <div className="flex items-start gap-2">
            <ClockIcon className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600">
              Checking out removes the record from storage for temporary use. The record status changes to "Checked Out" and must be returned by the due date.
            </p>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            checkoutMutation.mutate({ recordId, purpose, dueDate: new Date(dueDate).toISOString(), notes });
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="co-record" className="block text-sm font-medium text-slate-700 mb-1">Record ID or Barcode <span className="text-red-400">*</span></label>
            <input
              id="co-record"
              type="text"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="Scan barcode or enter record ID"
              required
              data-testid="checkout-record-input"
            />
          </div>
          <div>
            <label htmlFor="co-purpose" className="block text-sm font-medium text-slate-700 mb-1">Purpose <span className="text-red-400">*</span></label>
            <input
              id="co-purpose"
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="e.g. Annual audit review, agency request..."
              required
              data-testid="checkout-purpose-input"
            />
          </div>
          <div>
            <label htmlFor="co-due" className="block text-sm font-medium text-slate-700 mb-1">Due Date <span className="text-red-400">*</span></label>
            <input
              id="co-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              required
              data-testid="checkout-due-input"
            />
          </div>
          <div>
            <label htmlFor="co-notes" className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              id="co-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="Additional notes..."
              data-testid="checkout-notes-input"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowCheckout(false)} className="h-9 px-4 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={checkoutMutation.isPending} className="h-9 px-4 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 disabled:opacity-50 transition-colors" data-testid="confirm-checkout">
              {checkoutMutation.isPending ? 'Processing...' : 'Check Out'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Check In Modal */}
      <Modal isOpen={showCheckin} onClose={() => setShowCheckin(false)} title="Return Record (Check In)">
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-start gap-2">
            <CheckCircleIcon className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600">
              Returning a record places it back in Archives storage. Its status will change from "Checked Out" to "Active".
            </p>
          </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            checkinMutation.mutate({ recordId: checkinRecordId, notes: checkinNotes });
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="ci-record" className="block text-sm font-medium text-slate-700 mb-1">Record ID or Barcode <span className="text-red-400">*</span></label>
            <input
              id="ci-record"
              type="text"
              value={checkinRecordId}
              onChange={(e) => setCheckinRecordId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="Scan barcode or enter record ID"
              required
              data-testid="checkin-record-input"
            />
          </div>
          <div>
            <label htmlFor="ci-notes" className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              id="ci-notes"
              value={checkinNotes}
              onChange={(e) => setCheckinNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="Condition notes, return location..."
              data-testid="checkin-notes-input"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowCheckin(false)} className="h-9 px-4 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={checkinMutation.isPending} className="h-9 px-4 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 disabled:opacity-50 transition-colors" data-testid="confirm-checkin">
              {checkinMutation.isPending ? 'Processing...' : 'Return Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
