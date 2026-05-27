import { useState } from 'react';
import { PlusIcon, TrashIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { useApiQuery, useApiMutation } from '../../hooks/useApi';

interface TemplateField {
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
}

interface Template {
  id: string;
  name: string;
  description: string;
  agencyId?: string;
  fieldDefinitions: TemplateField[] | string;
  isActive: boolean;
  createdAt: string;
}

const DEFAULT_MAINE_FIELDS: TemplateField[] = [
  { label: 'Container Number', type: 'text', required: true },
  { label: 'Location Code (8-digit)', type: 'text', required: true },
  { label: 'Umbrella Agency', type: 'text', required: true },
  { label: 'Unit', type: 'text', required: true },
  { label: 'Record Series', type: 'text', required: true },
  { label: 'Date Range From', type: 'date', required: true },
  { label: 'Date Range To', type: 'date', required: true },
  { label: 'Disposition Date', type: 'date', required: false },
];

function parseFields(fd: TemplateField[] | string): TemplateField[] {
  if (Array.isArray(fd)) return fd;
  try { return JSON.parse(fd); } catch { return []; }
}

export function TemplatesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<TemplateField[]>([...DEFAULT_MAINE_FIELDS]);

  const { data: templates = [], refetch } = useApiQuery<Template[]>(['templates'], '/templates');

  const createMutation = useApiMutation<Template, object>('/templates', 'post', {
    onSuccess: () => { resetForm(); refetch(); },
  });

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setFields([...DEFAULT_MAINE_FIELDS]);
  }

  function openEdit(template: Template) {
    setEditingId(template.id);
    setName(template.name);
    setDescription(template.description || '');
    setFields(parseFields(template.fieldDefinitions));
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({ name, description, fields });
  }

  function addField() {
    setFields([...fields, { label: '', type: 'text', required: false }]);
  }

  function removeField(index: number) {
    setFields(fields.filter((_, i) => i !== index));
  }

  function updateField(index: number, key: keyof TemplateField, value: string | boolean) {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
  }

  return (
    <div data-testid="templates-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Record Templates</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage templates with Maine box label fields</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 h-9 px-3 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600"
          data-testid="create-template-button"
        >
          <PlusIcon className="w-4 h-4" />
          Create Template
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="text-left px-4 py-2.5 text-[11px] text-slate-400 uppercase tracking-wide font-medium">Name</th>
              <th className="text-left px-4 py-2.5 text-[11px] text-slate-400 uppercase tracking-wide font-medium">Description</th>
              <th className="text-left px-4 py-2.5 text-[11px] text-slate-400 uppercase tracking-wide font-medium">Fields</th>
              <th className="text-left px-4 py-2.5 text-[11px] text-slate-400 uppercase tracking-wide font-medium">Status</th>
              <th className="text-right px-4 py-2.5 text-[11px] text-slate-400 uppercase tracking-wide font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No templates yet. Create one to get started.</td></tr>
            )}
            {templates.map((t) => (
              <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{t.name}</td>
                <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{t.description}</td>
                <td className="px-4 py-3 text-slate-500">{parseFields(t.fieldDefinitions).length} fields</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${t.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                    {t.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(t)} className="text-sm text-navy-500 hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">{editingId ? 'Edit Template' : 'Create Template'}</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" required data-testid="template-name-input" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-navy-500" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">Fields (Maine Box Label)</label>
                  <button type="button" onClick={addField} className="flex items-center gap-1 text-xs text-navy-500 hover:text-navy-600 font-medium" data-testid="add-field-button">
                    <PlusCircleIcon className="w-4 h-4" /> Add Field
                  </button>
                </div>
                <div className="border border-slate-200 rounded-md divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {fields.length === 0 && (
                    <div className="px-4 py-3 text-sm text-slate-400 text-center">No fields added</div>
                  )}
                  {fields.map((field, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-2">
                      <input type="text" value={field.label} onChange={(e) => updateField(index, 'label', e.target.value)} placeholder="Field label" className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-navy-500" required />
                      <select value={field.type} onChange={(e) => updateField(index, 'type', e.target.value)} className="px-2 py-1.5 border border-slate-200 rounded text-sm">
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="select">Select</option>
                      </select>
                      <label className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                        <input type="checkbox" checked={field.required} onChange={(e) => updateField(index, 'required', e.target.checked)} className="rounded border-slate-300" />
                        Req
                      </label>
                      <button type="button" onClick={() => removeField(index)} className="p-1 text-slate-400 hover:text-red-500">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={resetForm} className="h-9 px-3 border border-slate-300 rounded text-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="h-9 px-4 bg-navy-500 text-white rounded text-sm font-medium hover:bg-navy-600 disabled:opacity-50" data-testid="submit-template-button">
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}