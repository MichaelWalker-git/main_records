import { useState, useRef, DragEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpTrayIcon, DocumentIcon, CheckCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import api from '../../services/api';

type Mode = 'choose' | 'upload' | 'manual';
type Step = 'input' | 'processing' | 'done';

export function CreateRecordPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('choose');
  const [step, setStep] = useState<Step>('input');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recordType, setRecordType] = useState('general');
  const [seriesId, setSeriesId] = useState('');
  const [agencyId, setAgencyId] = useState('');
  const [tags, setTags] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  function handleFile(f: File) {
    setFile(f);
    setError('');
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleUploadSubmit() {
    if (!file) {
      setError('Please select a document to upload.');
      return;
    }

    setStep('processing');
    setError('');

    try {
      setStatusMessage('Creating record...');
      const fileTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      const { data: createResp } = await api.post('/records', { title: fileTitle });
      const record = createResp.data ?? createResp;
      const recordId = record.id;

      setStatusMessage('Uploading document...');
      const { data: presignResp } = await api.post(`/records/${recordId}/upload`, {
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
      });
      const uploadUrl = presignResp.data?.uploadUrl ?? presignResp.uploadUrl;
      const s3Key = presignResp.data?.s3Key ?? presignResp.s3Key;

      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      });

      setStatusMessage('Submitting for AI processing...');
      await api.post(`/records/${recordId}/upload/confirm`, { s3Key });

      setStatusMessage('Document uploaded! Redirecting...');
      setStep('done');
      setTimeout(() => navigate(`/records/${recordId}`), 800);
    } catch (err: any) {
      setError(err?.message || 'Failed to process document. Please try again.');
      setStep('input');
    }
  }

  function validateManual(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    else if (title.trim().length < 3) e.title = 'Title must be at least 3 characters';
    if (!seriesId) e.seriesId = 'Record series is required';
    if (!agencyId) e.agencyId = 'Agency is required';
    return e;
  }

  async function handleManualSubmit(e: FormEvent) {
    e.preventDefault();
    const errors = validateManual();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setStep('processing');
    setStatusMessage('Creating record...');
    setError('');

    try {
      const { data: createResp } = await api.post('/records', {
        title,
        description,
        recordType,
        seriesId,
        agencyId,
        tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
      });
      const record = createResp.data ?? createResp;
      navigate(`/records/${record.id}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create record.');
      setStep('input');
    }
  }

  const fieldClass = (field: string) =>
    `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 ${
      formErrors[field] ? 'border-red-300 bg-red-50/30' : 'border-slate-300'
    }`;

  // Processing state
  if (step === 'processing') {
    return (
      <div data-testid="create-record-page">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">Create Record</h1>
          <p className="text-sm text-slate-500 mt-0.5">Processing...</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-12 max-w-2xl flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-slate-600 font-medium">{statusMessage}</p>
          {mode === 'upload' && <p className="text-xs text-slate-400">The AI will extract text and classify this record automatically.</p>}
        </div>
      </div>
    );
  }

  // Done state
  if (step === 'done') {
    return (
      <div data-testid="create-record-page">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">Create Record</h1>
          <p className="text-sm text-slate-500 mt-0.5">Document processed successfully</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-md p-12 max-w-2xl flex flex-col items-center gap-4">
          <CheckCircleIcon className="w-12 h-12 text-green-500" />
          <p className="text-sm text-slate-700 font-medium">Record created and document uploaded!</p>
          <p className="text-xs text-slate-400">OCR and AI classification have been initiated. Redirecting...</p>
        </div>
      </div>
    );
  }

  // Mode selection
  if (mode === 'choose') {
    return (
      <div data-testid="create-record-page">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-800">Create Record</h1>
          <p className="text-sm text-slate-500 mt-0.5">Choose how to create a new record</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <button
            onClick={() => setMode('upload')}
            className="bg-white border border-slate-200 rounded-md p-8 hover:border-navy-300 hover:shadow-sm transition-all text-left group"
            data-testid="mode-upload"
          >
            <ArrowUpTrayIcon className="w-10 h-10 text-navy-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Upload Document</h3>
            <p className="text-xs text-slate-500">Upload a PDF or image. AI will automatically extract text, classify, and fill all metadata.</p>
          </button>
          <button
            onClick={() => setMode('manual')}
            className="bg-white border border-slate-200 rounded-md p-8 hover:border-navy-300 hover:shadow-sm transition-all text-left group"
            data-testid="mode-manual"
          >
            <PencilSquareIcon className="w-10 h-10 text-pine-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Manual Entry</h3>
            <p className="text-xs text-slate-500">Enter record details manually. Use this for records without a digital document.</p>
          </button>
        </div>
      </div>
    );
  }

  // Upload mode
  if (mode === 'upload') {
    return (
      <div data-testid="create-record-page">
        <div className="mb-6">
          <button onClick={() => setMode('choose')} className="text-xs text-slate-400 hover:text-slate-600 mb-2">&larr; Back</button>
          <h1 className="text-xl font-bold text-slate-800">Create Record</h1>
          <p className="text-sm text-slate-500 mt-0.5">Upload a document — AI will extract and classify it automatically</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm" role="alert">{error}</div>
        )}
        <div className="bg-white border border-slate-200 rounded-md p-6 max-w-2xl">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.tiff,.tif,.doc,.docx"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            data-testid="file-input"
          />
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-md p-12 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
              dragOver ? 'border-navy-400 bg-navy-50/30' : file ? 'border-green-300 bg-green-50/20' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
            }`}
            data-testid="upload-dropzone"
          >
            {file ? (
              <>
                <DocumentIcon className="w-10 h-10 text-green-500" />
                <p className="text-sm font-medium text-slate-700">{file.name}</p>
                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB — Click or drop to replace</p>
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="w-10 h-10 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">Drop your document here or click to browse</p>
                <p className="text-xs text-slate-400">Supports PDF, images (PNG, JPG, TIFF), Word documents</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleUploadSubmit}
              disabled={!file}
              className="px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              data-testid="submit-record-button"
            >
              Upload & Create Record
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
          <div className="mt-4 pt-3 border-t border-slate-50">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-1.5">What happens next:</p>
            <ol className="text-xs text-slate-500 space-y-1 list-decimal list-inside">
              <li>Document is uploaded to secure storage (S3)</li>
              <li>AI extracts text via OCR (Claude Vision)</li>
              <li>AI classifies the record (series, tags, retention)</li>
              <li>Record is ready for review with all metadata filled</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Manual mode
  return (
    <div data-testid="create-record-page">
      <div className="mb-6">
        <button onClick={() => setMode('choose')} className="text-xs text-slate-400 hover:text-slate-600 mb-2">&larr; Back</button>
        <h1 className="text-xl font-bold text-slate-800">Create Record</h1>
        <p className="text-sm text-slate-500 mt-0.5">Enter record details manually</p>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm" role="alert">{error}</div>
      )}
      <form onSubmit={handleManualSubmit} className="bg-white border border-slate-200 rounded-md p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-400">*</span></label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={fieldClass('title')}
              data-testid="record-title-input"
            />
            {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
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
          <div>
            <label htmlFor="recordType" className="block text-sm font-medium text-slate-700 mb-1">Record Type</label>
            <select
              id="recordType"
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
            >
              <option value="general">General</option>
              <option value="case_file">Case File</option>
              <option value="financial">Financial</option>
              <option value="legal">Legal</option>
              <option value="permit">Permit</option>
              <option value="project_file">Project File</option>
              <option value="correspondence">Correspondence</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="series" className="block text-sm font-medium text-slate-700 mb-1">Record Series <span className="text-red-400">*</span></label>
              <select
                id="series"
                value={seriesId}
                onChange={(e) => setSeriesId(e.target.value)}
                className={fieldClass('seriesId')}
                data-testid="record-series-select"
              >
                <option value="">Select series...</option>
                <option value="GRS-1">GRS-1: Administrative Records</option>
                <option value="GRS-2">GRS-2: Financial Records</option>
                <option value="GRS-3">GRS-3: Personnel Records</option>
                <option value="GRS-4">GRS-4: Legal Case Files</option>
                <option value="GRS-5">GRS-5: Correspondence</option>
                <option value="GRS-6">GRS-6: Permits and Licenses</option>
                <option value="GRS-7">GRS-7: Meeting Minutes</option>
              </select>
              {formErrors.seriesId && <p className="text-xs text-red-500 mt-1">{formErrors.seriesId}</p>}
            </div>
            <div>
              <label htmlFor="agency" className="block text-sm font-medium text-slate-700 mb-1">Agency <span className="text-red-400">*</span></label>
              <select
                id="agency"
                value={agencyId}
                onChange={(e) => setAgencyId(e.target.value)}
                className={fieldClass('agencyId')}
                data-testid="record-agency-select"
              >
                <option value="">Select agency...</option>
                <option value="MSA">Maine State Archives</option>
                <option value="SOS">Secretary of State</option>
                <option value="DOE">Department of Education</option>
                <option value="DHHS">Health and Human Services</option>
                <option value="DOT">Department of Transportation</option>
                <option value="DEP">Environmental Protection</option>
              </select>
              {formErrors.agencyId && <p className="text-xs text-red-500 mt-1">{formErrors.agencyId}</p>}
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
            className="px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600 disabled:opacity-50 transition-colors"
            data-testid="submit-record-button"
          >
            Create Record
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