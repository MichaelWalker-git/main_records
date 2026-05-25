import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiMutation } from '../../hooks/useApi';

export function SubmitAccessionPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [seriesCode, setSeriesCode] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [boxCount, setBoxCount] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const mutation = useApiMutation<{ id: string }, object>('/agency/accessions', 'post', {
    onSuccess: () => navigate('/agency'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate({ title, description, seriesCode, dateRange, boxCount: Number(boxCount), contactName, contactPhone });
  }

  return (
    <div data-testid="submit-accession-page">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Submit Accession Request</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 max-w-2xl space-y-4">
        <div>
          <label htmlFor="acc-title" className="block text-sm font-medium text-slate-700 mb-1">Title / Description of Records</label>
          <input id="acc-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" required data-testid="accession-title-input" />
        </div>
        <div>
          <label htmlFor="acc-desc" className="block text-sm font-medium text-slate-700 mb-1">Additional Details</label>
          <textarea id="acc-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" data-testid="accession-description-input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="acc-series" className="block text-sm font-medium text-slate-700 mb-1">Record Series Code</label>
            <input id="acc-series" type="text" value={seriesCode} onChange={(e) => setSeriesCode(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" required data-testid="accession-series-input" />
          </div>
          <div>
            <label htmlFor="acc-dates" className="block text-sm font-medium text-slate-700 mb-1">Date Range</label>
            <input id="acc-dates" type="text" value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" placeholder="e.g. 2020-2024" data-testid="accession-dates-input" />
          </div>
        </div>
        <div>
          <label htmlFor="acc-boxes" className="block text-sm font-medium text-slate-700 mb-1">Number of Boxes</label>
          <input id="acc-boxes" type="number" value={boxCount} onChange={(e) => setBoxCount(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" required data-testid="accession-boxes-input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="acc-contact" className="block text-sm font-medium text-slate-700 mb-1">Contact Name</label>
            <input id="acc-contact" type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" required data-testid="accession-contact-input" />
          </div>
          <div>
            <label htmlFor="acc-phone" className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
            <input id="acc-phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" data-testid="accession-phone-input" />
          </div>
        </div>
        <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
          <button type="submit" disabled={mutation.isPending} className="px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600 disabled:opacity-50" data-testid="submit-accession-button">
            {mutation.isPending ? 'Submitting...' : 'Submit Request'}
          </button>
          <button type="button" onClick={() => navigate('/agency')} className="px-4 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50">Cancel</button>
        </div>
      </form>
    </div>
  );
}
