import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../shared/DataTable';
import StatusBadge from '../shared/StatusBadge';
import PriorityBadge from '../shared/PriorityBadge';
import SLAIndicator from '../shared/SLAIndicator';
import UserAvatar from '../shared/UserAvatar';
import SearchFilterBar from '../shared/SearchFilterBar';
import { formatRelative } from '../../utils/dateUtils';

const FILTERS = [
  { key: 'status', label: 'Status', options: [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'pending_customer', label: 'Pending Customer' },
    { value: 'closed', label: 'Closed' },
    { value: 'escalated', label: 'Escalated' },
  ]},
  { key: 'priority', label: 'Priority', options: [
    { value: 'P1', label: 'P1 Critical' },
    { value: 'P2', label: 'P2 High' },
    { value: 'P3', label: 'P3 Normal' },
  ]},
];

export default function TicketTable({ tickets, loading, showOrg = true, basePath = '/agent/tickets' }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filtered = tickets.filter(t => {
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.ticket_number.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.status && t.status !== filters.status) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    return true;
  });

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = [
    {
      key: 'ticket_number',
      label: '#',
      width: '100px',
      render: (v) => <span className="font-mono text-xs font-semibold text-[#01516A]">{v}</span>,
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (v, row) => (
        <div>
          <p className="text-sm font-medium text-[#0F0F0F] line-clamp-1">{v}</p>
          {showOrg && <p className="text-xs text-[#999] mt-0.5">{row.organisation?.name}</p>}
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      width: '120px',
      render: (v) => <PriorityBadge priority={v} />,
    },
    {
      key: 'status',
      label: 'Status',
      width: '150px',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: 'assigned_to',
      label: 'Assignee',
      width: '140px',
      render: (v) => v ? (
        <div className="flex items-center gap-2">
          <UserAvatar name={v.name} size="xs" />
          <span className="text-xs text-[#5C5C5C] truncate max-w-[80px]">{v.name}</span>
        </div>
      ) : <span className="text-xs text-[#999] italic">Unassigned</span>,
    },
    {
      key: 'sla_resolution_due',
      label: 'SLA',
      width: '180px',
      render: (v, row) => <SLAIndicator dueAt={v} pausedAt={row.sla_paused_at} showDate={false} />,
    },
    {
      key: 'updated_at',
      label: 'Updated',
      width: '100px',
      render: (v) => <span className="text-xs text-[#999]">{formatRelative(v)}</span>,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E8EAED] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div className="px-4 py-4 border-b border-[#E8EAED]">
        <SearchFilterBar
          value={search}
          onChange={v => { setSearch(v); setPage(1); }}
          placeholder="Search tickets..."
          filters={FILTERS}
          onFilterChange={(k, v) => { setFilters(prev => ({ ...prev, [k]: v })); setPage(1); }}
          filterValues={filters}
        />
      </div>
      <DataTable
        columns={columns}
        data={paged}
        loading={loading}
        emptyTitle="No tickets found"
        emptyDescription="No tickets match your current filters."
        onRowClick={(row) => navigate(`${basePath}/${row.id}`)}
        currentPage={page}
        totalPages={Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))}
        onPageChange={setPage}
        totalCount={filtered.length}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
