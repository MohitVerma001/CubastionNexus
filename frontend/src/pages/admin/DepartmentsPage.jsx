import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDepartment, updateDepartment } from '../../services/departments.service';
import useDepartments from '../../hooks/useDepartments';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import Modal from '../../components/shared/Modal';
import Button from '../../components/shared/Button';
import SearchFilterBar from '../../components/shared/SearchFilterBar';
import { formatDate } from '../../utils/dateUtils';

function DeptForm({ dept, onClose, onSave, loading }) {
  const [form, setForm] = useState(
    dept
      ? { name: dept.name, description: dept.description || '', is_active: dept.is_active }
      : { name: '', description: '', is_active: true }
  );
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">
          Department Name <span className="text-[#C81E1E]">*</span>
        </label>
        <input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          required
          placeholder="e.g. Technical Support"
          className="w-full px-3.5 py-2.5 text-sm border border-[#E0E2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          rows={3}
          placeholder="Brief description of this department's responsibilities."
          className="w-full px-3.5 py-2.5 text-sm border border-[#E0E2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white resize-none"
        />
      </div>
      {dept && (
        <div>
          <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">Status</label>
          <div className="flex items-center gap-3">
            {['active', 'inactive'].map(s => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dept_status"
                  value={s}
                  checked={(form.is_active ? 'active' : 'inactive') === s}
                  onChange={() => set('is_active', s === 'active')}
                  className="accent-[#01516A]"
                />
                <span className="text-sm text-[#5C5C5C] capitalize">{s}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit" loading={loading}>{dept ? 'Save Changes' : 'Create Department'}</Button>
      </div>
    </form>
  );
}

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { departments, loading } = useDepartments();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const onSuccess = (message) => {
    queryClient.invalidateQueries({ queryKey: ['departments'] });
    addToast(message, 'success');
    setShowModal(false);
  };

  const onError = (err) => {
    addToast(err?.response?.data?.message || 'An error occurred. Please try again.', 'error');
  };

  const createMutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => onSuccess('Department created successfully.'),
    onError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateDepartment(id, data),
    onSuccess: () => onSuccess('Department updated successfully.'),
    onError,
  });

  const handleSave = (data) => {
    if (editingDept) {
      updateMutation.mutate({ id: editingDept.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filtered = departments.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase())
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const columns = [
    {
      key: 'name',
      label: 'Department',
      render: v => <span className="text-sm font-medium text-[#0F0F0F]">{v}</span>,
    },
    {
      key: 'description',
      label: 'Description',
      render: v => <span className="text-sm text-[#5C5C5C]">{v || '—'}</span>,
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
      key: 'created_at',
      label: 'Created',
      width: '110px',
      render: v => <span className="text-xs text-[#999]">{formatDate(v)}</span>,
    },
    {
      key: 'actions',
      label: '',
      width: '60px',
      render: (_, row) => (
        <button
          onClick={e => { e.stopPropagation(); setEditingDept(row); setShowModal(true); }}
          className="p-1.5 rounded-lg hover:bg-[#EBF5FA] text-[#609CB8] transition-colors opacity-0 group-hover:opacity-100"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="Manage support team departments and agent assignments."
        breadcrumbs={['Admin', 'Departments']}
        action={
          <Button icon={Plus} onClick={() => { setEditingDept(null); setShowModal(true); }}>
            Add Department
          </Button>
        }
      />

      <div className="bg-white rounded-xl border border-[#E8EAED] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="px-4 py-4 border-b border-[#E8EAED]">
          <SearchFilterBar value={search} onChange={setSearch} placeholder="Search departments..." />
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          emptyTitle="No departments"
          emptyDescription="Add your first support department to get started."
        />
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingDept ? 'Edit Department' : 'Add Department'}
        size="sm"
      >
        <DeptForm
          dept={editingDept}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          loading={isSaving}
        />
      </Modal>
    </div>
  );
}
