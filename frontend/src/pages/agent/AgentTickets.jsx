import { useState, useEffect } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import useTickets from '../../hooks/useTickets';
import useOrganisations from '../../hooks/useOrganisations';
import { getUsers } from '../../services/users.service';
import { bulkUpdateTickets } from '../../services/tickets.service';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/shared/PageHeader';
import TicketTable from '../../components/tickets/TicketTable';
import SearchFilterBar from '../../components/shared/SearchFilterBar';
import Button from '../../components/shared/Button';

export default function AgentTickets() {
  const { addToast } = useToast();
  const { tickets, loading, filters, updateFilter, refetch } = useTickets();
  const { organisations } = useOrganisations();

  const [agents, setAgents] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkValue, setBulkValue] = useState('');
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

  const applyBulkAction = async () => {
    if (!bulkAction || selectedTickets.length === 0) return;
    try {
      await bulkUpdateTickets(selectedTickets, bulkAction, bulkValue);
      setSelectedTickets([]);
      setBulkAction('');
      setBulkValue('');
      await refetch();
      addToast(`${selectedTickets.length} tickets updated.`, 'success');
    } catch (err) {
      addToast('Bulk update failed.', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="All Tickets"
        subtitle="Manage and respond to tickets across all organizations."
        breadcrumbs={['Agent Portal', 'Tickets']}
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

      {selectedTickets.length > 0 && (
        <div className="bg-[#EBF5FA] border border-[#D3ECFB] rounded-lg px-4 py-3 flex items-center gap-3 mb-3 flex-wrap">
          <span className="text-sm text-[#01516A] font-medium">
            {selectedTickets.length} ticket{selectedTickets.length !== 1 ? 's' : ''} selected
          </span>
          <select
            value={bulkAction}
            onChange={e => { setBulkAction(e.target.value); setBulkValue(''); }}
            className="text-sm border border-[#D3ECFB] rounded-lg px-3 py-1.5 bg-white text-[#0F0F0F] focus:outline-none focus:border-[#01516A]"
          >
            <option value="">Select action...</option>
            <option value="assign">Assign to agent</option>
            <option value="priority">Change priority</option>
            <option value="close">Close tickets</option>
          </select>
          {bulkAction === 'assign' && (
            <select
              value={bulkValue}
              onChange={e => setBulkValue(e.target.value)}
              className="text-sm border border-[#D3ECFB] rounded-lg px-3 py-1.5 bg-white text-[#0F0F0F] focus:outline-none focus:border-[#01516A]"
            >
              <option value="">Select agent...</option>
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          )}
          {bulkAction === 'priority' && (
            <select
              value={bulkValue}
              onChange={e => setBulkValue(e.target.value)}
              className="text-sm border border-[#D3ECFB] rounded-lg px-3 py-1.5 bg-white text-[#0F0F0F] focus:outline-none focus:border-[#01516A]"
            >
              <option value="">Select priority...</option>
              <option value="P1">P1 Critical</option>
              <option value="P2">P2 High</option>
              <option value="P3">P3 Normal</option>
            </select>
          )}
          <Button size="sm" onClick={applyBulkAction} disabled={!bulkAction}>
            Apply
          </Button>
          <button
            onClick={() => { setSelectedTickets([]); setBulkAction(''); setBulkValue(''); }}
            className="text-xs text-[#707070] hover:text-[#0F0F0F] ml-auto"
          >
            ✕ Clear
          </button>
        </div>
      )}

      <TicketTable
        tickets={tickets}
        loading={loading}
        showOrg={true}
        basePath="/agent/tickets"
        hideInternalFilters={true}
        selectedTickets={selectedTickets}
        onSelectionChange={setSelectedTickets}
      />
    </div>
  );
}
