import { useState } from 'react';
import { LocationTree } from '../../components/LocationTree';
import { useApiQuery } from '../../hooks/useApi';
import { Location } from '../../types';

export function InventoryPage() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const { data: locations = [] } = useApiQuery<Location[]>(['locations'], '/inventory/locations');

  const utilization = selectedLocation
    ? Math.round((selectedLocation.currentCount / selectedLocation.capacity) * 100)
    : 0;

  return (
    <div data-testid="inventory-page">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Inventory Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">Browse storage locations and track utilization</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-md p-4">
          <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-3">Locations</h2>
          <LocationTree
            locations={locations}
            onSelect={setSelectedLocation}
            selectedId={selectedLocation?.id}
          />
        </div>

        <div className="lg:col-span-2">
          {selectedLocation ? (
            <div className="bg-white border border-slate-200 rounded-md p-5" data-testid="location-detail">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800">{selectedLocation.name}</h2>
                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded capitalize">{selectedLocation.locationType}</span>
              </div>
              <dl className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <dt className="text-[11px] text-slate-400 uppercase font-medium">Code</dt>
                  <dd className="mt-0.5 text-sm text-slate-700 font-mono">{selectedLocation.code}</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-400 uppercase font-medium">Capacity</dt>
                  <dd className="mt-0.5 text-sm text-slate-700 tabular-nums">{selectedLocation.capacity} units</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-400 uppercase font-medium">Occupied</dt>
                  <dd className="mt-0.5 text-sm text-slate-700 tabular-nums">{selectedLocation.currentCount} units</dd>
                </div>
                <div>
                  <dt className="text-[11px] text-slate-400 uppercase font-medium">Available</dt>
                  <dd className="mt-0.5 text-sm text-slate-700 tabular-nums">{selectedLocation.capacity - selectedLocation.currentCount} units</dd>
                </div>
              </dl>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-slate-400 uppercase font-medium">Utilization</span>
                  <span className={`text-xs font-semibold tabular-nums ${
                    utilization > 90 ? 'text-red-600' : utilization > 70 ? 'text-amber-600' : 'text-pine-600'
                  }`}>{utilization}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      utilization > 90
                        ? 'bg-red-500'
                        : utilization > 70
                        ? 'bg-amber-500'
                        : 'bg-pine-500'
                    }`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-md p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <p className="text-sm text-slate-500">Select a location to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}