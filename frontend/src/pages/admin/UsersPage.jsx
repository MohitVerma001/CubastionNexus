import { useState } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, KeyRound } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser, updateUser, deactivateUser, resetUserPassword } from '../../services/users.service';
import useUsers from '../../hooks/useUsers';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import UserAvatar from '../../components/shared/UserAvatar';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Button from '../../components/shared/Button';
import SearchFilterBar from '../../components/shared/SearchFilterBar';
import { formatRelative } from '../../utils/dateUtils';

const ROLE_STYLES = {
  admin: 'bg-[#FFF0D1] text-[#7A500F]',
  agent: 'bg-[#D3ECFB] text-[#01516A]',
  customer: 'bg-[#EBEBEB] text-[#5C5C5C]',
};

function UserForm({ user, onClose, onSave, loading }) {
  const [form, setForm] = useState(user || { name: '', email: '', role: 'customer', organisation: '', is_active: true });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">Full name <span className="text-[#C81E1E]">*</span></label>
          <input value={form.name} onChange={e => set('name', e.target.value)} required
            className="w-full px-3.5 py-2.5 text-sm border border-[#E0E2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">Email <span className="text-[#C81E1E]">*</span></label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required
            className="w-full px-3.5 py-2.5 text-sm border border-[#E0E2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">Role</label>
          <select value={form.role} onChange={e => set('role', e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-[#E0E2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white">
            <option value="customer">Customer</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">Status</label>
          <select value={form.is_active ? 'active' : 'inactive'} onChange={e => set('is_active', e.target.value === 'active')}
            className="w-full px-3.5 py-2.5 text-sm border border-[#E0E2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      {form.role === 'customer' && (
        <div>
          <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">Organization</label>
          <input value={form.organisation?.name || ''} onChange={e => set('organisation', { name: e.target.value })}
            placeholder="Organization name"
            className="w-full px-3.5 py-2.5 text-sm border border-[#E0E2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white" />
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>{user ? 'Save Changes' : 'Create User'}</Button>
      </div>
    </form>
  );
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { users, loading, refetch } = useUsers();
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);
  const [confirmReset, setConfirmReset] = useState(null);

  const onSuccess = (message) => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    addToast(message, 'success');
    setShowModal(false);
  };

  const onError = (err) => {
    addToast(err?.response?.data?.message || 'An error occurred. Please try again.', 'error');
  };

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => onSuccess('User created successfully.'),
    onError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateUser(id, data),
    onSuccess: () => onSuccess('User updated successfully.'),
    onError,
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      addToast('User deactivated.', 'success');
    },
    onError,
  });

  const resetMutation = useMutation({
    mutationFn: resetUserPassword,
    onSuccess: () => addToast('Password reset email sent.', 'success'),
    onError,
  });

  const handleSave = (data) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filtered = users.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterValues.role && u.role !== filterValues.role) return false;
    return true;
  });

  const FILTERS = [{ key: 'role', label: 'Role', options: [{ value: 'customer', label: 'Customer' }, { value: 'agent', label: 'Agent' }, { value: 'admin', label: 'Admin' }] }];

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const columns = [
    {
      key: 'name',
      label: 'User',
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={v} size="sm" />
          <div>
            <p className="text-sm font-medium text-[#0F0F0F]">{v}</p>
            <p className="text-xs text-[#999]">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      width: '120px',
      render: v => (
        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${ROLE_STYLES[v] || ''}`}>{v}</span>
      ),
    },
    {
      key: 'organisation',
      label: 'Organization',
      width: '180px',
      render: v => <span className="text-sm text-[#5C5C5C]">{v?.name || <span className="text-[#999] italic">Cubastion</span>}</span>,
    },
    {
      key: 'is_active',
      label: 'Status',
      width: '100px',
      render: v => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${v ? 'bg-[#DFF7E8] text-[#057A55]' : 'bg-[#F5F5F5] text-[#999]'}`}>
          {v ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'last_login_at',
      label: 'Last Login',
      width: '120px',
      render: v => <span className="text-xs text-[#999]">{formatRelative(v)}</span>,
    },
    {
      key: 'actions',
      label: '',
      width: '120px',
      render: (_, row) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={e => { e.stopPropagation(); setEditingUser(row); setShowModal(true); }}
            className="p-1.5 rounded-lg hover:bg-[#EBF5FA] text-[#609CB8] transition-colors" title="Edit">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={e => { e.stopPropagation(); setConfirmReset(row); }}
            className="p-1.5 rounded-lg hover:bg-[#FFF0D1] text-[#DC9117] transition-colors" title="Reset password">
            <KeyRound className="w-3.5 h-3.5" />
          </button>
          <button onClick={e => { e.stopPropagation(); setConfirmDeactivate(row); }}
            className="p-1.5 rounded-lg hover:bg-[#FDE8E8] text-[#C81E1E] transition-colors" title="Deactivate">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Manage user accounts, roles, and access."
        breadcrumbs={['Admin', 'Users']}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" icon={RefreshCw} size="sm" onClick={refetch}>Sync</Button>
            <Button icon={Plus} onClick={() => { setEditingUser(null); setShowModal(true); }}>Add User</Button>
          </div>
        }
      />

      <div className="bg-white rounded-xl border border-[#E8EAED] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="px-4 py-4 border-b border-[#E8EAED]">
          <SearchFilterBar
            value={search} onChange={setSearch}
            placeholder="Search users..."
            filters={FILTERS}
            onFilterChange={(k, v) => setFilterValues(p => ({ ...p, [k]: v }))}
            filterValues={filterValues}
          />
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyTitle="No users found"
          emptyDescription="Try adjusting your search or filters."
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
        size="md"
      >
        <UserForm
          user={editingUser}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          loading={isSaving}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDeactivate}
        onClose={() => setConfirmDeactivate(null)}
        onConfirm={() => deactivateMutation.mutate(confirmDeactivate.id)}
        title="Deactivate User"
        message={`Are you sure you want to deactivate ${confirmDeactivate?.name}? They will no longer be able to log in.`}
        confirmLabel="Deactivate"
        danger={true}
      />

      <ConfirmDialog
        isOpen={!!confirmReset}
        onClose={() => setConfirmReset(null)}
        onConfirm={() => resetMutation.mutate(confirmReset.id)}
        title="Reset Password"
        message={`Send a password reset email to ${confirmReset?.email}?`}
        confirmLabel="Send Reset Email"
        danger={false}
      />
    </div>
  );
}
