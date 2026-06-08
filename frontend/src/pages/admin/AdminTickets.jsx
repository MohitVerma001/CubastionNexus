import { useState, useEffect } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import useTickets from '../../hooks/useTickets';
import useOrganisations from '../../hooks/useOrganisations';
import { getUsers } from '../../services/users.service';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/shared/PageHeader';
import TicketTable from '../../components/tickets/TicketTable';
import SearchFilterBar from '../../components/shared/SearchFilterBar';
import Button from '../../components/shared/Button';

export default function AdminTickets() {
  const { addToast } = useToast();
  const { tickets, loading, filters, updateFilter, refetch } = useTickets();
  const { organisations } = useOrganisations();

  const [agents, setAgents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getUsers({ role: 'agent', is_active: true })
      .then(data => setAgents(data.data || data.users || []))
      .catch(() => {});
  }, []);

  const filterDefs = [
    {
      key: 'status',
      label: 'All Statuses',
      options: [
        { value: 'open', label: 'Open' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'pending_customer', label: 'Pending Customer' },
        { value: 'escalated', label: 'Escalated' },
        { value: 'closed', label: 'Closed' },
      ],
    },
    {
      key: 'priority',
      label: 'All Priorities',
      options: [
        { value: 'P1', label: 'P1 Critical' },
        { value: 'P2', label: 'P2 High' },
        { value: 'P3', label: 'P3 Normal' },
      ],
    },
    {
      key: 'organisation_id',
      label: 'All Organisations',
      options: organisations.map(o => ({ value: o.id, label: o.name })),
    },
    {
      key: 'assigned_to',
      label: 'All Agents',
      options: agents.map(a => ({ value: a.id, label: a.name })),
    },
  ];

  const exportCSV = () => {
    const headers = ['Ticket #', 'Subject', 'Organisation',
      'Priority', 'Status', 'Assigned To', 'Created', 'Updated'];
    const rows = tickets.map(t => [
      t.ticket_number,
      `"${(t.subject || '').replace(/"/g, '""')}"`,
      t.organisation?.name || '',
      t.priority,
      t.status,
      t.assigned_to?.name || 'Unassigned',
      t.created_at ? new Date(t.created_at).toISOString() : '',
      t.updated_at ? new Date(t.updated_at).toISOString() : '',
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="All Tickets"
        subtitle="Platform-wide ticket overview across all organisations."
        breadcrumbs={['Admin', 'Tickets']}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              icon={Download}
              size="sm"
              onClick={exportCSV}
            >
              Export CSV
            </Button>
            <Button
              variant="secondary"
              icon={RefreshCw}
              size="sm"
              loading={refreshing}
              onClick={async () => {
                setRefreshing(true);
                await refetch();
                setRefreshing(false);
              }}
            >
              Refresh
            </Button>
          </div>
        }
      />

      <div className="mb-4 space-y-3">
        <SearchFilterBar
          value={filters.search || ''}
          onChange={v => updateFilter('search', v)}
          placeholder="Search tickets..."
          filters={filterDefs}
          onFilterChange={updateFilter}
          filterValues={filters}
        />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#707070] whitespace-nowrap">From</label>
            <input
              type="date"
              value={filters.from_date || ''}
              onChange={e => updateFilter('from_date', e.target.value)}
              className="border border-[#E0E2E6] rounded-lg px-3 py-2 text-sm text-[#0F0F0F] focus:outline-none focus:border-[#01516A] bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#707070] whitespace-nowrap">To</label>
            <input
              type="date"
              value={filters.to_date || ''}
              onChange={e => updateFilter('to_date', e.target.value)}
              className="border border-[#E0E2E6] rounded-lg px-3 py-2 text-sm text-[#0F0F0F] focus:outline-none focus:border-[#01516A] bg-white"
            />
          </div>
        </div>
      </div>

      <TicketTable
        tickets={tickets}
        loading={loading}
        showOrg={true}
        basePath="/admin/tickets"
        hideInternalFilters={true}
      />
    </div>
  );
}
