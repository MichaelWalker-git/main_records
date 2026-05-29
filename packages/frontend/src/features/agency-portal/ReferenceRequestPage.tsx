import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiMutation, useApiQuery } from '../../hooks/useApi';
import { StatusBadge } from '../../components/StatusBadge';
import { useToast } from '../../components/Toast';

interface ReferenceRequest {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
}

export function ReferenceRequestPage() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('normal');

  const { data: existingRequests = [] } = useApiQuery<ReferenceRequest[]>(
    ['reference-requests'],
    '/agency/reference-requests'
  );

  const { toast } = useToast();
  const mutation = useApiMutation<{ id: string }, object>('/agency/reference-requests', 'post', {
    onSuccess: () => {
      setSubject('');
      setDescription('');
      setUrgency('normal');
      toast('Reference request submitted.', 'success');
    },
    onError: (err) => toast(err.message || 'Could not submit request.', 'error'),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate({ subject, description, urgency });
  }

  return (
    <div data-testid="reference-request-page">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Reference Requests</h1>
        <p className="text-sm text-slate-500 mt-0.5">Request access to archived records</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Submit New Request</h2>
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
            <div>
              <label htmlFor="ref-subject" className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input id="ref-subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" required data-testid="reference-subject-input" />
            </div>
            <div>
              <label htmlFor="ref-desc" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea id="ref-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" required data-testid="reference-description-input" />
            </div>
            <div>
              <label htmlFor="ref-urgency" className="block text-sm font-medium text-slate-700 mb-1">Urgency</label>
              <select id="ref-urgency" value={urgency} onChange={(e) => setUrgency(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" data-testid="reference-urgency-select">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={mutation.isPending} className="h-9 px-4 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 disabled:opacity-50 transition-colors" data-testid="submit-reference-button">
                {mutation.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
              <button type="button" onClick={() => navigate('/agency')} className="h-9 px-3 border border-slate-200 rounded text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Back</button>
            </div>
            {mutation.isSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                Request submitted successfully.
              </div>
            )}
          </form>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-4">My Requests</h2>
          <div className="space-y-3">
            {existingRequests.length === 0 ? (
              <p className="text-sm text-slate-500">No reference requests yet.</p>
            ) : (
              existingRequests.map((req) => (
                <div key={req.id} className="bg-white border border-slate-200 rounded-md p-4" data-testid={`reference-request-${req.id}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-slate-800">{req.subject}</h3>
                    <StatusBadge status={req.status} variant="small" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
