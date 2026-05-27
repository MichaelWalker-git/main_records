import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from '../../hooks/useApi';
import { RMSRecord as Record, Location } from '../../types';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export function EditRecordPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: record, isLoading } = useApiQuery<Record>(['record', id!], `/records/${id}`);
  const { data: locationsRaw } = useApiQuery<any>(['locations'], '/inventory/locations');
  const locations: Location[] = locationsRaw?.data ?? locationsRaw ?? [];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [seriesTitle, setSeriesTitle] = useState('');
  const [mediaType, setMediaType] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [boxNumber, setBoxNumber] = useState('');
  const [locationCode, setLocationCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setTitle(record.title || '');
      setDescription(record.description || '');
      setStatus(record.status || '');
      setSeriesTitle((record as any).seriesTitle || '');
      setMediaType((record as any).mediaType || '');
      setContainerNumber((record as any).containerNumber || '');
      setBoxNumber((record as any).boxNumber || '');
      setLocationCode((record as any).locationCode || (record as any).location_code || '');
    }
  }, [record]);

  const mutation = useApiMutation<Record, object>(`/records/${id}`, 'put', {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['record', id!] });
      queryClient.invalidateQueries({ queryKey: ['records'] });
      navigate(`/records/${id}`);
    },
    onError: (err) => setError(err.message),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setError('');
    const payload: any = { title };
    if (description) payload.description = description;
    if (status && status !== record?.status) payload.status = status;
    if (seriesTitle) payload.seriesTitle = seriesTitle;
    if (mediaType) payload.mediaType = mediaType;
    if (containerNumber) payload.containerNumber = containerNumber;
    if (boxNumber) payload.boxNumber = boxNumber;
    if (locationCode) payload.locationCode = locationCode;
    mutation.mutate(payload);
  }

  if (isLoading || !record) {
    return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div data-testid="edit-record-page">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Edit Record</h1>
        <p className="text-sm text-slate-500 mt-0.5">Modify record details</p>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-md p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
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
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="seriesTitle" className="block text-sm font-medium text-slate-700 mb-1">Series Title</label>
              <input
                id="seriesTitle"
                type="text"
                value={seriesTitle}
                onChange={(e) => setSeriesTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              />
            </div>
            <div>
              <label htmlFor="mediaType" className="block text-sm font-medium text-slate-700 mb-1">Media Type</label>
              <select
                id="mediaType"
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              >
                <option value="PHYSICAL">Physical</option>
                <option value="DIGITAL">Digital</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="containerNumber" className="block text-sm font-medium text-slate-700 mb-1">Container #</label>
              <input
                id="containerNumber"
                type="text"
                value={containerNumber}
                onChange={(e) => setContainerNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              />
            </div>
            <div>
              <label htmlFor="boxNumber" className="block text-sm font-medium text-slate-700 mb-1">Box #</label>
              <input
                id="boxNumber"
                type="text"
                value={boxNumber}
                onChange={(e) => setBoxNumber(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              />
            </div>
            <div>
              <label htmlFor="locationCode" className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <select
                id="locationCode"
                value={locationCode}
                onChange={(e) => setLocationCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
              >
                <option value="">No location assigned</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.code}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
            >
              <option value="active">Active</option>
              <option value="checked_out">Checked Out</option>
              <option value="in_transit">In Transit</option>
              <option value="on_hold">On Hold</option>
              <option value="pending_disposition">Pending Disposition</option>
              <option value="disposed">Disposed</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">Valid transitions are enforced by the system.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600 disabled:opacity-50 transition-colors"
          >
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/records/${id}`)}
            className="px-4 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}