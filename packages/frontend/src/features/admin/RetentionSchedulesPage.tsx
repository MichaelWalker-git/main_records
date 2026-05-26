import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { DataTable } from '../../components/DataTable';
import { Modal } from '../../components/Modal';
import { useApiQuery, useApiMutation } from '../../hooks/useApi';
import { RetentionSchedule } from '../../types';

export function RetentionSchedulesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [years, setYears] = useState('');
  const [method, setMethod] = useState<'destroy' | 'transfer' | 'archive'>('destroy');

  const { data: schedules = [], refetch } = useApiQuery<RetentionSchedule[]>(['retention-schedules'], '/admin/retention-schedules');

  const createMutation = useApiMutation<RetentionSchedule, object>('/admin/retention-schedules', 'post', {
    onSuccess: () => {
      setShowCreate(false);
      setCode('');
      setTitle('');
      setDescription('');
      setYears('');
      refetch();
    },
  });

  const columns = [
    { key: 'code', label: 'Code', sortable: true },
    { key: 'title', label: 'Title', sortable: true },
    { key: 'retentionYears', label: 'Retention (Years)' },
    { key: 'dispositionMethod', label: 'Disposition', render: (s: RetentionSchedule) => (
      <span className="capitalize">{s.dispositionMethod}</span>
    )},
    { key: 'isActive', label: 'Active', render: (s: RetentionSchedule) => (
      <span className={`text-xs font-medium ${s.isActive ? 'text-green-600' : 'text-slate-500'}`}>
        {s.isActive ? 'Yes' : 'No'}
      </span>
    )},
    { key: 'actions', label: '', render: (s: RetentionSchedule) => (
      <button className="text-sm text-navy-500 hover:underline" data-testid={`edit-schedule-${s.id}`}>Edit</button>
    )},
  ];

  return (
    <div data-testid="retention-schedules-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Retention Schedules</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configure record retention policies</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600"
          data-testid="create-schedule-button"
        >
          <PlusIcon className="w-4 h-4" />
          New Schedule
        </button>
      </div>
      <DataTable columns={columns} data={schedules} keyExtractor={(s) => s.id} />

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Retention Schedule" size="lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({ code, title, description, retentionYears: Number(years), dispositionMethod: method });
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="sched-code" className="block text-sm font-medium text-slate-700 mb-1">Code</label>
              <input id="sched-code" type="text" value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" required data-testid="schedule-code-input" />
            </div>
            <div>
              <label htmlFor="sched-years" className="block text-sm font-medium text-slate-700 mb-1">Retention Years</label>
              <input id="sched-years" type="number" value={years} onChange={(e) => setYears(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" required data-testid="schedule-years-input" />
            </div>
          </div>
          <div>
            <label htmlFor="sched-title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input id="sched-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" required data-testid="schedule-title-input" />
          </div>
          <div>
            <label htmlFor="sched-desc" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea id="sched-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" data-testid="schedule-description-input" />
          </div>
          <div>
            <label htmlFor="sched-method" className="block text-sm font-medium text-slate-700 mb-1">Disposition Method</label>
            <select id="sched-method" value={method} onChange={(e) => setMethod(e.target.value as 'destroy' | 'transfer' | 'archive')} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" data-testid="schedule-method-select">
              <option value="destroy">Destroy</option>
              <option value="transfer">Transfer</option>
              <option value="archive">Archive</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="px-3 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600 disabled:opacity-50" data-testid="submit-schedule-button">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
