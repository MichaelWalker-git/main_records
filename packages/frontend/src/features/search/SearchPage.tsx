import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SearchInput } from '../../components/SearchInput';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { EmptyState } from '../../components/EmptyState';
import { useApiMutation } from '../../hooks/useApi';
import { SearchResult } from '../../types';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

type SearchTab = 'metadata' | 'fulltext' | 'semantic' | 'ocr';

export function SearchPage() {
  const [activeTab, setActiveTab] = useState<SearchTab>('metadata');
  const [agencyFilter, setAgencyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const searchMutation = useApiMutation<SearchResult[], { query: string; type: SearchTab; agency?: string; status?: string }>(
    '/search',
    'post'
  );

  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim()) return;
      searchMutation.mutate({
        query,
        type: activeTab,
        ...(agencyFilter ? { agency: agencyFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeTab, agencyFilter, statusFilter]
  );

  const tabs: { key: SearchTab; label: string }[] = [
    { key: 'metadata', label: 'Metadata' },
    { key: 'fulltext', label: 'Full-Text' },
    { key: 'semantic', label: 'Semantic (AI)' },
    { key: 'ocr', label: 'OCR' },
  ];

  const rawData = searchMutation.data as any;
  const results: SearchResult[] = rawData?.data?.hits ?? rawData?.hits ?? rawData?.data ?? rawData ?? [];

  return (
    <div data-testid="search-page">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Search Records</h1>
        <p className="text-sm text-slate-500 mt-0.5">Find records across all agencies and series</p>
      </div>

      <div className="flex gap-0.5 mb-4 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? 'border-navy-500 text-navy-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            data-testid={`search-tab-${tab.key}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-md p-4 sticky top-6">
            <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">Filters</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Agency</label>
                <select
                  value={agencyFilter}
                  onChange={(e) => setAgencyFilter(e.target.value)}
                  className="w-full h-8 px-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                  data-testid="search-agency-filter"
                >
                  <option value="">All Agencies</option>
                  <option value="SOS">Secretary of State</option>
                  <option value="DOE">Department of Education</option>
                  <option value="DHHS">Health and Human Services</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-8 px-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                  data-testid="search-status-filter"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <SearchInput
            placeholder={`Search by ${activeTab}...`}
            onSearch={handleSearch}
            showSemanticToggle={activeTab === 'semantic'}
          />

          <div className="mt-4">
            {searchMutation.isPending && (
              <div className="flex justify-center py-8"><LoadingSpinner size="md" /></div>
            )}
            {!searchMutation.isPending && results.length === 0 && searchMutation.data && (
              <EmptyState icon={MagnifyingGlassIcon} title="No results found" message="Try different search terms or adjust your filters." />
            )}
            {results.length > 0 && (
              <div className="space-y-2" data-testid="search-results">
                <p className="text-xs text-slate-500 font-medium">{results.length} results</p>
                {results.map((result: any) => (
                  <Link key={result.id} to={`/records/${result.id}`} className="block bg-white border border-slate-200 rounded-md p-4 hover:border-navy-300 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-navy-600">{result.title}</h3>
                      {result.score && <span className="text-[10px] text-slate-400 font-mono">{(result.score * 100).toFixed(1)}%</span>}
                    </div>
                    {result.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{result.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      {result.agencyCode && <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{result.agencyCode}</span>}
                      {result.mediaType && <span className="text-[10px] text-slate-400">{result.mediaType}</span>}
                      {result.seriesTitle && <span className="text-[10px] text-slate-400">{result.seriesTitle}</span>}
                      {result.status && <span className="text-[10px] text-slate-400 capitalize">{result.status}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}