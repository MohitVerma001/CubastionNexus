import { MOCK_TICKETS } from '../../utils/mockData';
import PageHeader from '../../components/shared/PageHeader';
import TicketTable from '../../components/tickets/TicketTable';

export default function AdminTickets() {
  return (
    <div>
      <PageHeader
        title="All Tickets"
        subtitle="Platform-wide ticket overview."
        breadcrumbs={['Admin', 'Tickets']}
      />
      <TicketTable tickets={MOCK_TICKETS} loading={false} showOrg={true} basePath="/admin/tickets" />
    </div>
  );
}
