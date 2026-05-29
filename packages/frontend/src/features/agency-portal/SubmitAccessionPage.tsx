import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiMutation } from '../../hooks/useApi';
import { useToast } from '../../components/Toast';

interface FormErrors {
  title?: string;
  seriesCode?: string;
  boxCount?: string;
  contactName?: string;
}

export function SubmitAccessionPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [seriesCode, setSeriesCode] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [boxCount, setBoxCount] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { toast } = useToast();
  const mutation = useApiMutation<{ id: string }, object>('/agency/accessions', 'post', {
    onSuccess: () => {
      toast('Accession submitted.', 'success');
      navigate('/agency');
    },
    onError: (err) => toast(err.message || 'Could not submit accession.', 'error'),
  });

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!seriesCode.trim()) e.seriesCode = 'Series code is required';
    if (!boxCount || Number(boxCount) < 1) e.boxCount = 'Must be at least 1';
    if (!contactName.trim()) e.contactName = 'Contact name is required';
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
    setTouched({ title: true, seriesCode: true, boxCount: true, contactName: true });
    if (Object.keys(validationErrors).length > 0) return;
    mutation.mutate({ title, description, seriesCode, dateRange, boxCount: Number(boxCount), contactName, contactPhone });
  }

  const fieldClass = (field: keyof FormErrors) =>
    `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 ${
      touched[field] && errors[field] ? 'border-red-300 bg-red-50/30' : 'border-slate-300'
    }`;

  return (
    <div data-testid="submit-accession-page">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Submit Accession Request</h1>
        <p className="text-sm text-slate-500 mt-0.5">Request transfer of records to the State Archives</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-md p-6 max-w-2xl space-y-4">
        <div>
          <label htmlFor="acc-title" className="block text-sm font-medium text-slate-700 mb-1">Title / Description of Records <span className="text-red-400">*</span></label>
          <input id="acc-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => handleBlur('title')} className={fieldClass('title')} data-testid="accession-title-input" />
          {touched.title && errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>
        <div>
          <label htmlFor="acc-desc" className="block text-sm font-medium text-slate-700 mb-1">Additional Details</label>
          <textarea id="acc-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" data-testid="accession-description-input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="acc-series" className="block text-sm font-medium text-slate-700 mb-1">Record Series Code <span className="text-red-400">*</span></label>
            <input id="acc-series" type="text" value={seriesCode} onChange={(e) => setSeriesCode(e.target.value)} onBlur={() => handleBlur('seriesCode')} className={fieldClass('seriesCode')} data-testid="accession-series-input" />
            {touched.seriesCode && errors.seriesCode && <p className="text-xs text-red-500 mt-1">{errors.seriesCode}</p>}
          </div>
          <div>
            <label htmlFor="acc-dates" className="block text-sm font-medium text-slate-700 mb-1">Date Range</label>
            <input id="acc-dates" type="text" value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" placeholder="e.g. 2020-2024" data-testid="accession-dates-input" />
          </div>
        </div>
        <div>
          <label htmlFor="acc-boxes" className="block text-sm font-medium text-slate-700 mb-1">Number of Boxes <span className="text-red-400">*</span></label>
          <input id="acc-boxes" type="number" min="1" value={boxCount} onChange={(e) => setBoxCount(e.target.value)} onBlur={() => handleBlur('boxCount')} className={fieldClass('boxCount')} data-testid="accession-boxes-input" />
          {touched.boxCount && errors.boxCount && <p className="text-xs text-red-500 mt-1">{errors.boxCount}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="acc-contact" className="block text-sm font-medium text-slate-700 mb-1">Contact Name <span className="text-red-400">*</span></label>
            <input id="acc-contact" type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} onBlur={() => handleBlur('contactName')} className={fieldClass('contactName')} data-testid="accession-contact-input" />
            {touched.contactName && errors.contactName && <p className="text-xs text-red-500 mt-1">{errors.contactName}</p>}
          </div>
          <div>
            <label htmlFor="acc-phone" className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
            <input id="acc-phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" data-testid="accession-phone-input" />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
          <button type="submit" disabled={mutation.isPending} className="h-9 px-4 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 disabled:opacity-50 transition-colors" data-testid="submit-accession-button">
            {mutation.isPending ? 'Submitting...' : 'Submit Request'}
          </button>
          <button type="button" onClick={() => navigate('/agency')} className="h-9 px-3 border border-slate-200 rounded text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  );
}