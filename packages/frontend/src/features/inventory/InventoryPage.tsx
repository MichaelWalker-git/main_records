import { useState } from 'react';
import { LocationTree } from '../../components/LocationTree';
import { useApiQuery } from '../../hooks/useApi';
import { Location } from '../../types';

export function InventoryPage() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const { data: locations = [] } = useApiQuery<Location[]>(['locations'], '/locations');

  return (
    <div data-testid="inventory-page">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Inventory Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Locations</h2>
          <LocationTree
            locations={locations}
            onSelect={setSelectedLocation}
            selectedId={selectedLocation?.id}
          />
        </div>
        <div className="lg:col-span-2">
          {selectedLocation ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6" data-testid="location-detail">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">{selectedLocation.name}</h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-slate-500 uppercase">Code</dt>
                  <dd className="mt-1 text-sm text-slate-700 font-mono">{selectedLocation.code}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 uppercase">Type</dt>
                  <dd className="mt-1 text-sm text-slate-700 capitalize">{selectedLocation.type}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 uppercase">Capacity</dt>
                  <dd className="mt-1 text-sm text-slate-700">{selectedLocation.capacity} units</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 uppercase">Occupied</dt>
                  <dd className="mt-1 text-sm text-slate-700">{selectedLocation.occupied} units</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-slate-500 uppercase">Utilization</dt>
                  <dd className="mt-2">
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          (selectedLocation.occupied / selectedLocation.capacity) > 0.9
                            ? 'bg-red-500'
                            : (selectedLocation.occupied / selectedLocation.capacity) > 0.7
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((selectedLocation.occupied / selectedLocation.capacity) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {Math.round((selectedLocation.occupied / selectedLocation.capacity) * 100)}% utilized
                    </p>
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
              <p className="text-slate-500">Select a location to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
