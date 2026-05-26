import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import { usePaginatedQuery, useApiMutation } from '../../hooks/useApi';
import { User } from '../../types';

export function UsersPage() {
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newRole, setNewRole] = useState('viewer');

  const { data, isLoading, refetch } = usePaginatedQuery<User>(
    ['users'],
    '/admin/users',
    { page, pageSize: 25 }
  );

  const createMutation = useApiMutation<User, object>('/admin/users', 'post', {
    onSuccess: () => {
      setShowCreate(false);
      refetch();
    },
  });

  const columns = [
    { key: 'email', label: 'Email', sortable: true },
    { key: 'name', label: 'Name', render: (u: User) => `${u.firstName} ${u.lastName}` },
    { key: 'roles', label: 'Roles', render: (u: User) => (
      <div className="flex gap-1 flex-wrap">
        {u.roles.map((role) => (
          <span key={role} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{role.replace('_', ' ')}</span>
        ))}
      </div>
    )},
    { key: 'isActive', label: 'Status', render: (u: User) => (
      <StatusBadge status={u.isActive ? 'active' : 'inactive'} />
    )},
    { key: 'actions', label: '', render: (u: User) => (
      <button className="text-sm text-navy-500 hover:underline" data-testid={`edit-user-${u.id}`}>
        Edit
      </button>
    )},
  ];

  return (
    <div data-testid="users-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">User Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage system users and roles</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600"
          data-testid="create-user-button"
        >
          <PlusIcon className="w-4 h-4" />
          Add User
        </button>
      </div>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
        pagination={data ? { page: data.page, pageSize: data.pageSize, total: data.total, totalPages: data.totalPages } : undefined}
        onPageChange={setPage}
      />

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add User">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({ email: newEmail, firstName: newFirstName, lastName: newLastName, roles: [newRole] });
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="user-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input id="user-email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" required data-testid="user-email-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="user-first" className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input id="user-first" type="text" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" required data-testid="user-first-input" />
            </div>
            <div>
              <label htmlFor="user-last" className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input id="user-last" type="text" value={newLastName} onChange={(e) => setNewLastName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" required data-testid="user-last-input" />
            </div>
          </div>
          <div>
            <label htmlFor="user-role" className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select id="user-role" value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500" data-testid="user-role-select">
              <option value="viewer">Viewer</option>
              <option value="agency_user">Agency User</option>
              <option value="records_officer">Records Officer</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="px-3 py-2 border border-slate-300 rounded-md text-sm hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-navy-500 text-white rounded-md text-sm font-medium hover:bg-navy-600 disabled:opacity-50" data-testid="submit-user-button">Add User</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
