import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { useApiQuery, useApiMutation } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { LegalHold } from '../../types';
import { format } from 'date-fns';

export function LegalHoldsPage() {
  const { isAdmin } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [recordId, setRecordId] = useState('');
  const [reason, setReason] = useState('');

  const { data: holds = [], refetch } = useApiQuery<LegalHold[]>(['legal-holds'], '/dispositions/legal-holds');

  const createMutation = useApiMutation<LegalHold, object>('/dispositions/legal-holds', 'post', {
    onSuccess: () => {
      setShowCreate(false);
      setRecordId('');
      setReason('');
      refetch();
    },
  });

  const columns = [
    { key: 'reason', label: 'Reason', sortable: true, render: (h: LegalHold) => (
      <span className="text-sm font-medium text-slate-800 truncate block max-w-[250px]">{h.reason}</span>
    )},
    { key: 'recordId', label: 'Record', render: (h: LegalHold) => (
      <span className="font-mono text-xs">{h.recordId?.slice(0, 8) || '—'}</span>
    )},
    { key: 'placedBy', label: 'Placed By', render: (h: LegalHold) => (
      <span className="text-xs">{h.placedBy?.slice(0, 8) || '—'}</span>
    )},
    { key: 'placedAt', label: 'Placed', render: (h: LegalHold) => {
      try { return <span>{format(new Date(h.placedAt), 'MMM d, yyyy')}</span>; }
      catch { return <span>—</span>; }
    }},
    { key: 'isActive', label: 'Status', render: (h: LegalHold) => (
      <span className={`text-xs font-medium ${h.isActive ? 'text-orange-600' : 'text-slate-500'}`}>
        {h.isActive ? 'Active' : 'Released'}
      </span>
    )},
  ];

  return (
    <div data-testid="legal-holds-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Legal Holds</h1>
          <p className="text-sm text-slate-500 mt-0.5">Records exempt from disposition</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 h-9 px-3 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 transition-colors"
            data-testid="create-hold-button"
          >
            <PlusIcon className="w-4 h-4" />
            New Hold
          </button>
        )}
      </div>
      <DataTable columns={columns} data={holds} keyExtractor={(h) => h.id} />

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Apply Legal Hold">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({ recordId, reason });
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="hold-record" className="block text-sm font-medium text-slate-700 mb-1">Record ID</label>
            <input
              id="hold-record"
              type="text"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="Enter record UUID"
              required
              data-testid="hold-record-input"
            />
          </div>
          <div>
            <label htmlFor="hold-reason" className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
            <textarea
              id="hold-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              required
              data-testid="hold-reason-input"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="h-9 px-4 border border-slate-300 rounded text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="h-9 px-4 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 disabled:opacity-50 transition-colors"
              data-testid="submit-hold-button"
            >
              Apply Hold
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
