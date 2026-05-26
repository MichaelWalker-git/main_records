import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useApiMutation } from '../../hooks/useApi';

interface BoxItem {
  id: string;
  boxNumber: string;
  description: string;
  seriesTitle: string;
  dateRange: string;
}

export function SubmitTransmittalPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<BoxItem[]>([
    { id: '1', boxNumber: '', description: '', seriesTitle: '', dateRange: '' },
  ]);
  const [submitted, setSubmitted] = useState(false);

  const mutation = useApiMutation<any, object>('/transmittals', 'post', {
    onSuccess: (resp) => {
      const t = resp?.data ?? resp;
      navigate(`/transmittals/${t.id}`);
    },
  });

  function addItem() {
    setItems([...items, { id: String(Date.now()), boxNumber: '', description: '', seriesTitle: '', dateRange: '' }]);
  }

  function removeItem(id: string) {
    setItems(items.filter((i) => i.id !== id));
  }

  function updateItem(id: string, field: keyof BoxItem, value: string) {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }

  function hasItemErrors(): boolean {
    return items.some((i) => !i.boxNumber.trim() || !i.description.trim() || !i.seriesTitle.trim());
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (hasItemErrors()) return;
    mutation.mutate({ title: title || `Records Transfer - ${new Date().toLocaleDateString()}`, description: notes, items });
  }

  function itemFieldClass(value: string): string {
    return `w-full px-2 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 ${
      submitted && !value.trim() ? 'border-red-300 bg-red-50/30' : 'border-slate-300'
    }`;
  }

  return (
    <div data-testid="submit-transmittal-page">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Submit Transmittal</h1>
        <p className="text-sm text-slate-500 mt-0.5">Transfer records to the State Archives</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-md p-6">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="e.g. Q1 2024 Records Transfer"
              data-testid="transmittal-title"
            />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-6">
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-4">Boxes / Items</h2>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 gap-3 items-end" data-testid={`transmittal-item-${idx}`}>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">Box # <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={item.boxNumber}
                    onChange={(e) => updateItem(item.id, 'boxNumber', e.target.value)}
                    className={itemFieldClass(item.boxNumber)}
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-slate-500 mb-1">Description <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className={itemFieldClass(item.description)}
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-slate-500 mb-1">Series <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={item.seriesTitle}
                    onChange={(e) => updateItem(item.id, 'seriesTitle', e.target.value)}
                    className={itemFieldClass(item.seriesTitle)}
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-slate-500 mb-1">Date Range</label>
                  <input
                    type="text"
                    value={item.dateRange}
                    onChange={(e) => updateItem(item.id, 'dateRange', e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    placeholder="e.g. 2020-2024"
                  />
                </div>
                <div className="col-span-1">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                    aria-label="Remove item"
                    data-testid={`remove-item-${idx}`}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {submitted && hasItemErrors() && (
            <p className="text-xs text-red-500 mt-2">Please fill in all required fields for each box.</p>
          )}
          <button
            type="button"
            onClick={addItem}
            className="mt-4 flex items-center gap-1 text-sm text-navy-500 hover:text-navy-600 font-medium transition-colors"
            data-testid="add-item-button"
          >
            <PlusIcon className="w-4 h-4" />
            Add Box
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-6">
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
            data-testid="transmittal-notes"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600 disabled:opacity-50 transition-colors"
            data-testid="submit-transmittal-form-button"
          >
            {mutation.isPending ? 'Submitting...' : 'Submit Transmittal'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/transmittals')}
            className="px-4 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}