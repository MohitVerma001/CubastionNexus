import { MOCK_TICKETS } from '../../utils/mockData';
import PageHeader from '../../components/shared/PageHeader';
import TicketTable from '../../components/tickets/TicketTable';
import Button from '../../components/shared/Button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AgentTickets() {
  const navigate = useNavigate();
  return (
    <div>
      <PageHeader
        title="All Tickets"
        subtitle="Manage and respond to tickets across all organizations."
        breadcrumbs={['Agent Portal', 'Tickets']}
        action={<Button icon={Plus} onClick={() => navigate('/agent/tickets/new')}>Create Ticket</Button>}
      />
      <TicketTable tickets={MOCK_TICKETS} loading={false} showOrg={true} basePath="/agent/tickets" />
    </div>
  );
}
