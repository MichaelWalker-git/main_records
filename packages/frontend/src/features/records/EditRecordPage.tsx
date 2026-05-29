import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from '../../hooks/useApi';
import {
  RMSRecord as Record,
  Location,
  DigitalMaineDocumentType,
  DIGITAL_MAINE_DOCUMENT_TYPES,
} from '../../types';
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
  const [umbrella, setUmbrella] = useState('');
  const [unit, setUnit] = useState('');
  const [subunit, setSubunit] = useState('');
  const [agency3, setAgency3] = useState('');
  const [trNumber, setTrNumber] = useState('');
  const [dispoDate, setDispoDate] = useState('');
  const [rfidEnabled, setRfidEnabled] = useState(false);
  const [contributingInstitution, setContributingInstitution] = useState('');
  const [documentTypeDm, setDocumentTypeDm] = useState<DigitalMaineDocumentType | ''>('');
  const [dmIdentifier, setDmIdentifier] = useState('');
  const [exactCreationDate, setExactCreationDate] = useState('');
  const [docLanguage, setDocLanguage] = useState('');
  const [docLocation, setDocLocation] = useState('');
  const [keywords, setKeywords] = useState('');
  const [recommendedCitation, setRecommendedCitation] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (record) {
      setTitle(record.title || '');
      setDescription(record.description || '');
      setStatus(record.status || '');
      setSeriesTitle(record.seriesTitle || '');
      setMediaType(record.mediaType || '');
      setContainerNumber(record.containerNumber || '');
      setBoxNumber(record.boxNumber || '');
      setLocationCode(record.locationCode || (record as any).location_code || '');
      setUmbrella(record.umbrella || '');
      setUnit(record.unit || '');
      setSubunit(record.subunit || '');
      setAgency3(record.agency3 || '');
      setTrNumber(record.trNumber || record.transmittalNumber || '');
      setDispoDate((record.dispoDate || '').slice(0, 10));
      setRfidEnabled(!!record.rfidEnabled);
      setContributingInstitution(record.contributingInstitution || '');
      setDocumentTypeDm((record.documentTypeDm as DigitalMaineDocumentType) || '');
      setDmIdentifier(record.dmIdentifier || '');
      setExactCreationDate((record.exactCreationDate || '').slice(0, 10));
      setDocLanguage(record.docLanguage || '');
      setDocLocation(record.docLocation || '');
      setKeywords(Array.isArray(record.keywords) ? record.keywords.join(', ') : '');
      setRecommendedCitation(record.recommendedCitation || '');
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
    if (umbrella) payload.umbrella = umbrella;
    if (unit) payload.unit = unit;
    if (subunit) payload.subunit = subunit;
    if (agency3) payload.agency3 = agency3;
    if (trNumber) payload.trNumber = trNumber;
    if (dispoDate) payload.dispoDate = dispoDate;
    payload.rfidEnabled = rfidEnabled;
    if (contributingInstitution) payload.contributingInstitution = contributingInstitution;
    if (documentTypeDm) payload.documentTypeDm = documentTypeDm;
    if (dmIdentifier) payload.dmIdentifier = dmIdentifier;
    if (exactCreationDate) payload.exactCreationDate = exactCreationDate;
    if (docLanguage) payload.docLanguage = docLanguage;
    if (docLocation) payload.docLocation = docLocation;
    const parsedKeywords = keywords
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
    payload.keywords = parsedKeywords;
    if (recommendedCitation) payload.recommendedCitation = recommendedCitation;
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
          <fieldset className="border-t border-slate-100 pt-4">
            <legend className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Box Label (RFP Block 3)</legend>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="umbrella" className="block text-sm font-medium text-slate-700 mb-1">Umbrella</label>
                <input
                  id="umbrella"
                  type="text"
                  value={umbrella}
                  onChange={(e) => setUmbrella(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="e.g. Executive Branch"
                />
              </div>
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                <input
                  id="unit"
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                />
              </div>
              <div>
                <label htmlFor="subunit" className="block text-sm font-medium text-slate-700 mb-1">Subunit</label>
                <input
                  id="subunit"
                  type="text"
                  value={subunit}
                  onChange={(e) => setSubunit(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label htmlFor="agency3" className="block text-sm font-medium text-slate-700 mb-1">Agency (3-letter)</label>
                <input
                  id="agency3"
                  type="text"
                  maxLength={10}
                  value={agency3}
                  onChange={(e) => setAgency3(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="MSA"
                />
              </div>
              <div>
                <label htmlFor="trNumber" className="block text-sm font-medium text-slate-700 mb-1">Transmittal #</label>
                <input
                  id="trNumber"
                  type="text"
                  value={trNumber}
                  onChange={(e) => setTrNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                />
              </div>
              <div>
                <label htmlFor="dispoDate" className="block text-sm font-medium text-slate-700 mb-1">Dispo Date</label>
                <input
                  id="dispoDate"
                  type="date"
                  value={dispoDate}
                  onChange={(e) => setDispoDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={rfidEnabled}
                  onChange={(e) => setRfidEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-navy-500 focus:ring-navy-500"
                  data-testid="rfid-toggle"
                />
                RFID-tagged container (optional, RFP §VI)
              </label>
            </div>
          </fieldset>
          <fieldset
            className="border-t border-slate-100 pt-4"
            data-testid="classification-metadata-fieldset"
          >
            <legend className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Classification Metadata (digitalmaine.com)
            </legend>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="contributingInstitution" className="block text-sm font-medium text-slate-700 mb-1">Contributing Institution</label>
                <input
                  id="contributingInstitution"
                  type="text"
                  value={contributingInstitution}
                  onChange={(e) => setContributingInstitution(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="Maine State Archives"
                  data-testid="edit-contributing-institution"
                />
              </div>
              <div>
                <label htmlFor="documentTypeDm" className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                <select
                  id="documentTypeDm"
                  value={documentTypeDm}
                  onChange={(e) => setDocumentTypeDm(e.target.value as DigitalMaineDocumentType | '')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                  data-testid="edit-document-type-dm"
                >
                  <option value="">—</option>
                  {DIGITAL_MAINE_DOCUMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="dmIdentifier" className="block text-sm font-medium text-slate-700 mb-1">Identifier</label>
                <input
                  id="dmIdentifier"
                  type="text"
                  value={dmIdentifier}
                  onChange={(e) => setDmIdentifier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="15-28455-F026-I016"
                  data-testid="edit-dm-identifier"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label htmlFor="exactCreationDate" className="block text-sm font-medium text-slate-700 mb-1">Exact Creation Date</label>
                <input
                  id="exactCreationDate"
                  type="date"
                  value={exactCreationDate}
                  onChange={(e) => setExactCreationDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                  data-testid="edit-exact-creation-date"
                />
              </div>
              <div>
                <label htmlFor="docLanguage" className="block text-sm font-medium text-slate-700 mb-1">Language</label>
                <input
                  id="docLanguage"
                  type="text"
                  value={docLanguage}
                  onChange={(e) => setDocLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="English"
                  data-testid="edit-doc-language"
                />
              </div>
              <div>
                <label htmlFor="docLocation" className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  id="docLocation"
                  type="text"
                  value={docLocation}
                  onChange={(e) => setDocLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                  placeholder="Portland, ME"
                  data-testid="edit-doc-location"
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="keywords" className="block text-sm font-medium text-slate-700 mb-1">Keywords</label>
              <input
                id="keywords"
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                placeholder="Maine, World War I, National Guard"
                data-testid="edit-keywords"
              />
              <p className="text-xs text-slate-400 mt-1">Comma-separated.</p>
            </div>
            <div className="mt-4">
              <label htmlFor="recommendedCitation" className="block text-sm font-medium text-slate-700 mb-1">Recommended Citation</label>
              <textarea
                id="recommendedCitation"
                value={recommendedCitation}
                onChange={(e) => setRecommendedCitation(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 font-mono text-xs"
                placeholder='Grant, Giles C., "Letter to a Doctor..." (1917). Maine State Archives.'
                data-testid="edit-recommended-citation"
              />
            </div>
          </fieldset>
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