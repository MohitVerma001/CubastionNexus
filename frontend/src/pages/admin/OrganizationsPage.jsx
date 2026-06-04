import { useState } from 'react';
import { Plus, Pencil, Building2 } from 'lucide-react';
import { MOCK_ORGANISATIONS } from '../../utils/mockData';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import Modal from '../../components/shared/Modal';
import Button from '../../components/shared/Button';
import SearchFilterBar from '../../components/shared/SearchFilterBar';
import { formatDate } from '../../utils/dateUtils';

function OrgForm({ org, onClose, onSave }) {
  const [form, setForm] = useState(org || { name: '', primary_contact: '', email: '', is_active: true });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); onClose(); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">Organization Name <span className="text-[#C81E1E]">*</span></label>
        <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Fujikura Ltd."
          className="w-full px-3.5 py-2.5 text-sm border border-[#E0E2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">Primary Contact</label>
          <input value={form.primary_contact} onChange={e => set('primary_contact', e.target.value)} placeholder="Contact name"
            className="w-full px-3.5 py-2.5 text-sm border border-[#E0E2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">Support Email</label>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="support@company.co.jp"
            className="w-full px-3.5 py-2.5 text-sm border border-[#E0E2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">Status</label>
        <div className="flex items-center gap-3">
          {['active', 'inactive'].map(s => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="status" value={s} checked={(form.is_active ? 'active' : 'inactive') === s} onChange={() => set('is_active', s === 'active')}
                className="accent-[#01516A]" />
              <span className="text-sm text-[#5C5C5C] capitalize">{s}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
        <Button type="submit">{org ? 'Save Changes' : 'Create Organization'}</Button>
      </div>
    </form>
  );
}

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState(MOCK_ORGANISATIONS);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);

  const filtered = orgs.filter(o =>
    !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.primary_contact?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'name',
      label: 'Organization',
      render: (v) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EBF5FA] flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-[#01516A]" />
          </div>
          <span className="text-sm font-medium text-[#0F0F0F]">{v}</span>
        </div>
      ),
    },
    {
      key: 'primary_contact',
      label: 'Primary Contact',
      render: v => <span className="text-sm text-[#5C5C5C]">{v || '—'}</span>,
    },
    {
      key: 'email',
      label: 'Support Email',
      render: v => <span className="text-sm text-[#5C5C5C]">{v || '—'}</span>,
    },
    {
      key: 'ticket_count',
      label: 'Tickets',
      width: '100px',
      render: v => <span className="text-sm font-medium text-[#0F0F0F]">{v}</span>,
    },
    {
      key: 'open_count',
      label: 'Open',
      width: '80px',
      render: v => <span className={`text-sm font-semibold ${v > 3 ? 'text-[#C81E1E]' : 'text-[#0F0F0F]'}`}>{v}</span>,
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
      label: 'Since',
      width: '100px',
      render: v => <span className="text-xs text-[#999]">{formatDate(v)}</span>,
    },
    {
      key: 'actions',
      label: '',
      width: '60px',
      render: (_, row) => (
        <button onClick={e => { e.stopPropagation(); setEditingOrg(row); setShowModal(true); }}
          className="p-1.5 rounded-lg hover:bg-[#EBF5FA] text-[#609CB8] transition-colors opacity-0 group-hover:opacity-100">
          <Pencil className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Organizations"
        subtitle="Manage client organizations and their support configurations."
        breadcrumbs={['Admin', 'Organizations']}
        action={<Button icon={Plus} onClick={() => { setEditingOrg(null); setShowModal(true); }}>Add Organization</Button>}
      />

      <div className="bg-white rounded-xl border border-[#E8EAED] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="px-4 py-4 border-b border-[#E8EAED]">
          <SearchFilterBar value={search} onChange={setSearch} placeholder="Search organizations..." />
        </div>
        <DataTable columns={columns} data={filtered} emptyTitle="No organizations" emptyDescription="Add your first client organization to get started." />
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingOrg ? 'Edit Organization' : 'Add Organization'} size="md">
        <OrgForm
          org={editingOrg}
          onClose={() => setShowModal(false)}
          onSave={data => {
            if (editingOrg) setOrgs(prev => prev.map(o => o.id === editingOrg.id ? { ...o, ...data } : o));
            else setOrgs(prev => [...prev, { ...data, id: `org-${Date.now()}`, ticket_count: 0, open_count: 0 }]);
          }}
        />
      </Modal>
    </div>
  );
}
