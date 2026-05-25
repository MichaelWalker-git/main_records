import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useApiMutation } from '../../hooks/useApi';
import { Transmittal } from '../../types';

interface BoxItem {
  id: string;
  boxNumber: string;
  description: string;
  seriesTitle: string;
  dateRange: string;
}

export function SubmitTransmittalPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<BoxItem[]>([
    { id: '1', boxNumber: '', description: '', seriesTitle: '', dateRange: '' },
  ]);

  const mutation = useApiMutation<Transmittal, object>('/transmittals', 'post', {
    onSuccess: (data) => navigate(`/transmittals/${data.id}`),
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

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate({ notes, items });
  }

  return (
    <div data-testid="submit-transmittal-page">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Submit Transmittal</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Boxes / Items</h2>
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 gap-3 items-end" data-testid={`transmittal-item-${idx}`}>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">Box #</label>
                  <input
                    type="text"
                    value={item.boxNumber}
                    onChange={(e) => updateItem(item.id, 'boxNumber', e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-slate-500 mb-1">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs text-slate-500 mb-1">Series</label>
                  <input
                    type="text"
                    value={item.seriesTitle}
                    onChange={(e) => updateItem(item.id, 'seriesTitle', e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    required
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
                    className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30"
                    aria-label="Remove item"
                    data-testid={`remove-item-${idx}`}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-4 flex items-center gap-1 text-sm text-navy-500 hover:text-navy-600 font-medium"
            data-testid="add-item-button"
          >
            <PlusIcon className="w-4 h-4" />
            Add Box
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6">
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
            className="px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600 disabled:opacity-50"
            data-testid="submit-transmittal-form-button"
          >
            {mutation.isPending ? 'Submitting...' : 'Submit Transmittal'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/transmittals')}
            className="px-4 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
