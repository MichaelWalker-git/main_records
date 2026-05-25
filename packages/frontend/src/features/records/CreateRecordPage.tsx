import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiMutation } from '../../hooks/useApi';
import { RMSRecord as Record } from '../../types';

export function CreateRecordPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [agencyId, setAgencyId] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');

  const mutation = useApiMutation<Record, object>('/records', 'post', {
    onSuccess: (data) => navigate(`/records/${data.id}`),
    onError: (err) => setError(err.message),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    mutation.mutate({
      title,
      description,
      seriesId,
      agencyId,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
  }

  return (
    <div data-testid="create-record-page">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Create Record</h1>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              required
              data-testid="record-title-input"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              data-testid="record-description-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="series" className="block text-sm font-medium text-slate-700 mb-1">Record Series</label>
              <select
                id="series"
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                required
                data-testid="record-series-select"
              >
                <option value="">Select series...</option>
                <option value="GRS-1">GRS-1: Administrative Records</option>
                <option value="GRS-2">GRS-2: Financial Records</option>
                <option value="GRS-3">GRS-3: Personnel Records</option>
              </select>
            </div>
            <div>
              <label htmlFor="agency" className="block text-sm font-medium text-slate-700 mb-1">Agency</label>
              <select
                id="agency"
                value={agencyId}
                onChange={(e) => setAgencyId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                required
                data-testid="record-agency-select"
              >
                <option value="">Select agency...</option>
                <option value="SOS">Secretary of State</option>
                <option value="DOE">Department of Education</option>
                <option value="DHHS">Health and Human Services</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              placeholder="e.g. confidential, 2024, audit"
              data-testid="record-tags-input"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-200">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600 disabled:opacity-50"
            data-testid="submit-record-button"
          >
            {mutation.isPending ? 'Creating...' : 'Create Record'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/records')}
            className="px-4 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50"
            data-testid="cancel-button"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
