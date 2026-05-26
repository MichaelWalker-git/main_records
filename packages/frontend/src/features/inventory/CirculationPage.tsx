import { useState } from 'react';
import { ArrowRightOnRectangleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { useApiQuery, useApiMutation } from '../../hooks/useApi';
import { format } from 'date-fns';

interface CirculationEvent {
  id: string;
  record_id: string;
  record_title?: string;
  user_id: string;
  user_name?: string;
  event_type: 'checkout' | 'checkin';
  checked_out_at: string;
  due_date: string;
  checked_in_at?: string;
  notes?: string;
}

export function CirculationPage() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [recordId, setRecordId] = useState('');
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
    { key: 'record_title', label: 'Record', render: (e: CirculationEvent) => (
      <span className="font-medium text-slate-800">{e.record_title || e.record_id.slice(0, 8)}</span>
    )},
    { key: 'user_name', label: 'Checked Out By', render: (e: CirculationEvent) => e.user_name || e.user_id.slice(0, 8) },
    { key: 'checked_out_at', label: 'Checked Out', render: (e: CirculationEvent) => format(new Date(e.checked_out_at), 'MMM d, yyyy') },
    { key: 'due_date', label: 'Due Date', render: (e: CirculationEvent) => (
      <span className="text-red-600 font-medium">{format(new Date(e.due_date), 'MMM d, yyyy')}</span>
    )},
    { key: 'status', label: 'Status', render: () => <StatusBadge status="overdue" /> },
    { key: 'actions', label: '', render: (e: CirculationEvent) => (
      <button
        onClick={() => { setCheckinRecordId(e.record_id); setShowCheckin(true); }}
        className="text-sm text-navy-500 hover:underline font-medium"
      >
        Check In
      </button>
    )},
  ];

  return (
    <div data-testid="circulation-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Circulation</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track record check-out and check-in</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCheckin(true)}
            className="flex items-center gap-1.5 h-9 px-3 border border-slate-300 rounded text-sm font-medium hover:bg-slate-50 transition-colors"
            data-testid="checkin-button"
          >
            <ArrowLeftOnRectangleIcon className="w-4 h-4" />
            Check In
          </button>
          <button
            onClick={() => setShowCheckout(true)}
            className="flex items-center gap-1.5 h-9 px-3 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 transition-colors"
            data-testid="checkout-button"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Check Out
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Overdue Items</h2>
        </div>
        <DataTable
          columns={overdueColumns}
          data={overdueData}
          keyExtractor={(e) => e.id}
        />
        {overdueData.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-500">
            No overdue items. All records returned on time.
          </div>
        )}
      </div>

      {/* Check Out Modal */}
      <Modal isOpen={showCheckout} onClose={() => setShowCheckout(false)} title="Check Out Record">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            checkoutMutation.mutate({ record_id: recordId, due_date: new Date(dueDate).toISOString(), notes });
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
              placeholder="Purpose of checkout, requesting agency..."
              data-testid="checkout-notes-input"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowCheckout(false)} className="px-3 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={checkoutMutation.isPending} className="px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600 disabled:opacity-50" data-testid="confirm-checkout">
              {checkoutMutation.isPending ? 'Processing...' : 'Check Out'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Check In Modal */}
      <Modal isOpen={showCheckin} onClose={() => setShowCheckin(false)} title="Check In Record">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            checkinMutation.mutate({ record_id: checkinRecordId, notes: checkinNotes });
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
            <button type="button" onClick={() => setShowCheckin(false)} className="px-3 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={checkinMutation.isPending} className="px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600 disabled:opacity-50" data-testid="confirm-checkin">
              {checkinMutation.isPending ? 'Processing...' : 'Check In'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}