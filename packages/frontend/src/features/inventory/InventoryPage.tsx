import { useState } from 'react';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { LocationTree } from '../../components/LocationTree';
import { Modal } from '../../components/Modal';
import { useApiQuery } from '../../hooks/useApi';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import { useAuth } from '../../hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Location } from '../../types';

type LocationType = 'building' | 'floor' | 'room' | 'shelf' | 'box';

interface LocationFormState {
  name: string;
  code: string;
  parent_id: string;
  location_type: LocationType;
  capacity: string;
  vacant_location: boolean;
  rfid_enabled: boolean;
}

const EMPTY_FORM: LocationFormState = {
  name: '',
  code: '',
  parent_id: '',
  location_type: 'building',
  capacity: '100',
  vacant_location: false,
  rfid_enabled: false,
};

function flattenTree(locations: Location[]): Location[] {
  const out: Location[] = [];
  const walk = (nodes: Location[]) => {
    for (const n of nodes) {
      out.push(n);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(locations);
  return out;
}

export function InventoryPage() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LocationFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const { data: locations = [] } = useApiQuery<Location[]>(['locations'], '/inventory/locations');
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { isAdmin, isStaff } = useAuth();
  const queryClient = useQueryClient();
  const canManage = isAdmin || isStaff;

  const flat = flattenTree(locations);

  const utilization = selectedLocation && selectedLocation.capacity > 0
    ? Math.round((selectedLocation.currentCount / selectedLocation.capacity) * 100)
    : 0;

  function openCreate(parent?: Location) {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      parent_id: parent?.id ?? '',
      location_type: parent ? nextType(parent.locationType as LocationType) : 'building',
    });
    setShowForm(true);
  }

  function openEdit(location: Location) {
    setEditingId(location.id);
    setForm({
      name: location.name,
      code: location.code,
      parent_id: location.parentId ?? '',
      location_type: location.locationType as LocationType,
      capacity: String(location.capacity),
      vacant_location: !!(location as any).vacantLocation,
      rfid_enabled: !!(location as any).rfidEnabled,
    });
    setShowForm(true);
  }

  function nextType(parentType: LocationType): LocationType {
    const order: LocationType[] = ['building', 'floor', 'room', 'shelf', 'box'];
    const idx = order.indexOf(parentType);
    return order[Math.min(idx + 1, order.length - 1)];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      toast('Name and code are required.', 'error');
      return;
    }
    const capacity = Number(form.capacity);
    if (!Number.isInteger(capacity) || capacity <= 0) {
      toast('Capacity must be a positive number.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        location_type: form.location_type,
        capacity,
        parent_id: form.parent_id || undefined,
        vacant_location: form.vacant_location,
        rfid_enabled: form.rfid_enabled,
      };
      if (editingId) {
        await api.put(`/inventory/locations/${editingId}`, payload);
        toast('Location updated.', 'success');
      } else {
        await api.post('/inventory/locations', payload);
        toast('Location created.', 'success');
      }
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    } catch (err: unknown) {
      toast(extractError(err, 'Save failed.'), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(location: Location) {
    const ok = await confirm({
      title: 'Deactivate Location',
      description: `Are you sure you want to deactivate "${location.name}"? It will be hidden from active operations.`,
      confirmLabel: 'Deactivate',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await api.delete(`/inventory/locations/${location.id}`);
      toast('Location deactivated.', 'success');
      if (selectedLocation?.id === location.id) setSelectedLocation(null);
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    } catch (err: unknown) {
      toast(extractError(err, 'Deactivate failed.'), 'error');
    }
  }

  function extractError(err: unknown, fallback: string): string {
    const e = err as { response?: { data?: { error?: string; message?: string } }; message?: string };
    return e?.response?.data?.error || e?.response?.data?.message || e?.message || fallback;
  }

  return (
    <div data-testid="inventory-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Inventory Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Browse storage locations, manage hierarchy, and track utilization</p>
        </div>
        {canManage && (
          <button
            onClick={() => openCreate()}
            className="flex items-center gap-1.5 h-9 px-3 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 transition-colors"
            data-testid="new-location-button"
          >
            <PlusIcon className="w-4 h-4" />
            New Location
          </button>
        )}
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
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">{selectedLocation.name}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded capitalize">{selectedLocation.locationType}</span>
                    {(selectedLocation as any).vacantLocation && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-medium text-amber-700" data-testid="vacant-badge">
                        Vacant
                      </span>
                    )}
                    {(selectedLocation as any).rfidEnabled && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-medium text-emerald-700" data-testid="loc-rfid-indicator">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        RFID
                      </span>
                    )}
                  </div>
                </div>
                {canManage && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openCreate(selectedLocation)}
                      className="inline-flex items-center gap-1 h-8 px-2 text-xs border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                      data-testid="add-child-location-button"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      Add child
                    </button>
                    <button
                      onClick={() => openEdit(selectedLocation)}
                      className="inline-flex items-center gap-1 h-8 px-2 text-xs border border-slate-200 rounded text-slate-600 hover:bg-slate-50"
                      data-testid="edit-location-button"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeactivate(selectedLocation)}
                      className="inline-flex items-center gap-1 h-8 px-2 text-xs border border-red-200 rounded text-red-600 hover:bg-red-50"
                      data-testid="deactivate-location-button"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                      Deactivate
                    </button>
                  </div>
                )}
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
              <p className="text-sm text-slate-500">Select a location to view details</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? 'Edit Location' : 'New Location'}
      >
        <form onSubmit={handleSubmit} className="space-y-3" data-testid="location-form">
          <div>
            <label htmlFor="loc-name" className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
            <input
              id="loc-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
              required
              data-testid="loc-name-input"
            />
          </div>
          <div>
            <label htmlFor="loc-code" className="block text-xs font-medium text-slate-600 mb-1">Code *</label>
            <input
              id="loc-code"
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 font-mono"
              required
              data-testid="loc-code-input"
            />
          </div>
          <div>
            <label htmlFor="loc-type" className="block text-xs font-medium text-slate-600 mb-1">Type *</label>
            <select
              id="loc-type"
              value={form.location_type}
              onChange={(e) => setForm({ ...form, location_type: e.target.value as LocationType })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
              data-testid="loc-type-select"
            >
              <option value="building">Building</option>
              <option value="floor">Floor</option>
              <option value="room">Room</option>
              <option value="shelf">Shelf</option>
              <option value="box">Box</option>
            </select>
          </div>
          <div>
            <label htmlFor="loc-parent" className="block text-xs font-medium text-slate-600 mb-1">Parent location</label>
            <select
              id="loc-parent"
              value={form.parent_id}
              onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
              data-testid="loc-parent-select"
            >
              <option value="">— No parent (top level) —</option>
              {flat
                .filter((l) => l.id !== editingId)
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.code} — {l.name} ({l.locationType})
                  </option>
                ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">Required for non-building types. Building / floor / room / shelf / box hierarchy.</p>
          </div>
          <div>
            <label htmlFor="loc-capacity" className="block text-xs font-medium text-slate-600 mb-1">Capacity (units) *</label>
            <input
              id="loc-capacity"
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy-500 tabular-nums"
              required
              data-testid="loc-capacity-input"
            />
          </div>
          <div className="flex items-center gap-6 pt-1">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.vacant_location}
                onChange={(e) => setForm({ ...form, vacant_location: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-navy-500 focus:ring-navy-500"
                data-testid="loc-vacant-toggle"
              />
              Vacant location
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.rfid_enabled}
                onChange={(e) => setForm({ ...form, rfid_enabled: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-navy-500 focus:ring-navy-500"
                data-testid="loc-rfid-toggle"
              />
              RFID-enabled shelf
            </label>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-9 px-3 text-sm border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-9 px-3 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 disabled:opacity-50"
              data-testid="loc-submit-button"
            >
              {submitting ? 'Saving...' : editingId ? 'Save changes' : 'Create location'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
