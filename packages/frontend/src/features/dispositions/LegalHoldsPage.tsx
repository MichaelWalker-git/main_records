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
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');

  const { data: holds = [], refetch } = useApiQuery<LegalHold[]>(['legal-holds'], '/legal-holds');

  const createMutation = useApiMutation<LegalHold, object>('/legal-holds', 'post', {
    onSuccess: () => {
      setShowCreate(false);
      setTitle('');
      setReason('');
      refetch();
    },
  });

  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'reason', label: 'Reason' },
    { key: 'issuedBy', label: 'Issued By' },
    { key: 'issuedAt', label: 'Issued', render: (h: LegalHold) => format(new Date(h.issuedAt), 'MMM d, yyyy') },
    { key: 'recordIds', label: 'Records', render: (h: LegalHold) => h.recordIds.length },
    { key: 'isActive', label: 'Status', render: (h: LegalHold) => (
      <span className={`text-xs font-medium ${h.isActive ? 'text-orange-600' : 'text-slate-500'}`}>
        {h.isActive ? 'Active' : 'Released'}
      </span>
    )},
  ];

  return (
    <div data-testid="legal-holds-page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Legal Holds</h1>
        {isAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600"
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
            createMutation.mutate({ title, reason });
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="hold-title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              id="hold-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              required
              data-testid="hold-title-input"
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
              className="px-3 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600 disabled:opacity-50"
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
