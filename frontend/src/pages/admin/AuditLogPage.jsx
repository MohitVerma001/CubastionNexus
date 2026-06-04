import { useState } from 'react';
import { MOCK_AUDIT_LOGS } from '../../utils/mockData';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import SearchFilterBar from '../../components/shared/SearchFilterBar';
import { formatDateTime } from '../../utils/dateUtils';
import { ArrowRight } from 'lucide-react';

const ACTION_STYLES = {
  status_changed: 'bg-[#D3ECFB] text-[#01516A]',
  assigned: 'bg-[#DFF7E8] text-[#057A55]',
  priority_changed: 'bg-[#FFF0D1] text-[#7A500F]',
  closed: 'bg-[#F5F5F5] text-[#5C5C5C]',
  comment_added: 'bg-[#EBF5FA] text-[#609CB8]',
  escalated: 'bg-[#FDE8E8] text-[#C81E1E]',
};

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const logs = MOCK_AUDIT_LOGS;

  const filtered = logs.filter(l =>
    !search || l.ticket_number?.toLowerCase().includes(search.toLowerCase()) ||
    l.actor?.toLowerCase().includes(search.toLowerCase()) ||
    l.action?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'created_at',
      label: 'Timestamp',
      width: '170px',
      render: v => <span className="text-xs text-[#5C5C5C] font-mono">{formatDateTime(v)}</span>,
    },
    {
      key: 'ticket_number',
      label: 'Ticket',
      width: '110px',
      render: v => v ? <span className="font-mono text-xs font-semibold text-[#01516A]">{v}</span> : '—',
    },
    {
      key: 'action',
      label: 'Action',
      width: '160px',
      render: v => (
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${ACTION_STYLES[v] || 'bg-[#F5F5F5] text-[#5C5C5C]'}`}>
          {(v || '').replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'old_value',
      label: 'Change',
      render: (v, row) => (
        <div className="flex items-center gap-2 text-xs text-[#5C5C5C]">
          {v && <span className="px-1.5 py-0.5 bg-[#F5F5F5] rounded text-[#999] line-through">{v}</span>}
          {v && row.new_value && <ArrowRight className="w-3 h-3 text-[#999] shrink-0" />}
          {row.new_value && <span className="px-1.5 py-0.5 bg-[#EBF5FA] rounded text-[#01516A]">{row.new_value}</span>}
        </div>
      ),
    },
    {
      key: 'actor',
      label: 'Actor',
      width: '160px',
      render: v => <span className="text-sm text-[#0F0F0F]">{v}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle="Read-only record of all system actions and changes."
        breadcrumbs={['Admin', 'Audit Log']}
      />

      <div className="bg-white rounded-xl border border-[#E8EAED] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="px-4 py-4 border-b border-[#E8EAED]">
          <SearchFilterBar value={search} onChange={setSearch} placeholder="Search logs..." />
        </div>
        <DataTable columns={columns} data={filtered} emptyTitle="No audit logs" emptyDescription="No events found for your search." />
      </div>
    </div>
  );
}
