import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import useTickets from '../../hooks/useTickets';
import useOrganisations from '../../hooks/useOrganisations';
import PageHeader from '../../components/shared/PageHeader';
import TicketTable from '../../components/tickets/TicketTable';
import SearchFilterBar from '../../components/shared/SearchFilterBar';
import Button from '../../components/shared/Button';

export default function AgentTickets() {
  const navigate = useNavigate();
  const { tickets, loading, filters, updateFilter } = useTickets();
  const { organisations } = useOrganisations();

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
  ];

  return (
    <div>
      <PageHeader
        title="All Tickets"
        subtitle="Manage and respond to tickets across all organizations."
        breadcrumbs={['Agent Portal', 'Tickets']}
        action={<Button icon={Plus} onClick={() => navigate('/agent/tickets/new')}>Create Ticket</Button>}
      />
      <div className="mb-4">
        <SearchFilterBar
          value={filters.search || ''}
          onChange={v => updateFilter('search', v)}
          placeholder="Search tickets..."
          filters={filterDefs}
          onFilterChange={updateFilter}
          filterValues={filters}
        />
      </div>
      <TicketTable tickets={tickets} loading={loading} showOrg={true} basePath="/agent/tickets" />
    </div>
  );
}
