import { useState, useCallback } from 'react';
import { SearchInput } from '../../components/SearchInput';
import { RecordCard } from '../../components/RecordCard';
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

  const searchMutation = useApiMutation<{ results: SearchResult[] }, { query: string; type: SearchTab; filters: object }>(
    '/search',
    'post'
  );

  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim()) return;
      searchMutation.mutate({
        query,
        type: activeTab,
        filters: { agency: agencyFilter || undefined, status: statusFilter || undefined },
      });
    },
    [activeTab, agencyFilter, statusFilter, searchMutation]
  );

  const tabs: { key: SearchTab; label: string }[] = [
    { key: 'metadata', label: 'Metadata' },
    { key: 'fulltext', label: 'Full-Text' },
    { key: 'semantic', label: 'Semantic (AI)' },
    { key: 'ocr', label: 'OCR' },
  ];

  const results = searchMutation.data?.results ?? [];

  return (
    <div data-testid="search-page">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Search Records</h1>
      <div className="flex gap-1 mb-4 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-navy-500 text-navy-500'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            data-testid={`search-tab-${tab.key}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Filters</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Agency</label>
                <select
                  value={agencyFilter}
                  onChange={(e) => setAgencyFilter(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                  data-testid="search-agency-filter"
                >
                  <option value="">All Agencies</option>
                  <option value="SOS">Secretary of State</option>
                  <option value="DOE">Department of Education</option>
                  <option value="DHHS">Health and Human Services</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
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

          <div className="mt-6">
            {searchMutation.isPending && (
              <div className="flex justify-center py-8"><LoadingSpinner size="md" /></div>
            )}
            {!searchMutation.isPending && results.length === 0 && searchMutation.data && (
              <EmptyState icon={MagnifyingGlassIcon} title="No results found" message="Try different search terms or adjust your filters." />
            )}
            {results.length > 0 && (
              <div className="space-y-3" data-testid="search-results">
                <p className="text-sm text-slate-500">{results.length} results</p>
                {results.map((result) =>
                  result.record ? (
                    <RecordCard key={result.id} record={result.record} />
                  ) : (
                    <div key={result.id} className="bg-white border border-slate-200 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-slate-800">{result.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{result.snippet}</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
