import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiMutation } from '../../hooks/useApi';
import { RMSRecord as Record } from '../../types';

interface FormErrors {
  title?: string;
  seriesId?: string;
  agencyId?: string;
}

export function CreateRecordPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [seriesId, setSeriesId] = useState('');
  const [agencyId, setAgencyId] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const mutation = useApiMutation<Record, object>('/records', 'post', {
    onSuccess: (data) => navigate(`/records/${data.id}`),
    onError: (err) => setError(err.message),
  });

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!title.trim()) e.title = 'Title is required';
    else if (title.trim().length < 3) e.title = 'Title must be at least 3 characters';
    if (!seriesId) e.seriesId = 'Record series is required';
    if (!agencyId) e.agencyId = 'Agency is required';
    return e;
  }

  function handleBlur(field: string) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate());
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({ title: true, seriesId: true, agencyId: true });
    if (Object.keys(validationErrors).length > 0) return;

    setError('');
    mutation.mutate({
      title,
      description,
      seriesId,
      agencyId,
      tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
    });
  }

  const fieldClass = (field: keyof FormErrors) =>
    `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 ${
      touched[field] && errors[field] ? 'border-red-300 bg-red-50/30' : 'border-slate-300'
    }`;

  return (
    <div data-testid="create-record-page">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Create Record</h1>
        <p className="text-sm text-slate-500 mt-0.5">Add a new record to the system</p>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-md p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-400">*</span></label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => handleBlur('title')}
              className={fieldClass('title')}
              data-testid="record-title-input"
            />
            {touched.title && errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
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
              <label htmlFor="series" className="block text-sm font-medium text-slate-700 mb-1">Record Series <span className="text-red-400">*</span></label>
              <select
                id="series"
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                onBlur={() => handleBlur('seriesId')}
                className={fieldClass('seriesId')}
                data-testid="record-series-select"
              >
                <option value="">Select series...</option>
                <option value="GRS-1">GRS-1: Administrative Records</option>
                <option value="GRS-2">GRS-2: Financial Records</option>
                <option value="GRS-3">GRS-3: Personnel Records</option>
              </select>
              {touched.seriesId && errors.seriesId && <p className="text-xs text-red-500 mt-1">{errors.seriesId}</p>}
            </div>
            <div>
              <label htmlFor="agency" className="block text-sm font-medium text-slate-700 mb-1">Agency <span className="text-red-400">*</span></label>
              <select
                id="agency"
                value={agencyId}
                onChange={(e) => setAgencyId(e.target.value)}
                onBlur={() => handleBlur('agencyId')}
                className={fieldClass('agencyId')}
                data-testid="record-agency-select"
              >
                <option value="">Select agency...</option>
                <option value="SOS">Secretary of State</option>
                <option value="DOE">Department of Education</option>
                <option value="DHHS">Health and Human Services</option>
              </select>
              {touched.agencyId && errors.agencyId && <p className="text-xs text-red-500 mt-1">{errors.agencyId}</p>}
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
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600 disabled:opacity-50 transition-colors"
            data-testid="submit-record-button"
          >
            {mutation.isPending ? 'Creating...' : 'Create Record'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/records')}
            className="px-4 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50 transition-colors"
            data-testid="cancel-button"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}