import { Ticket, Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_TICKETS } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import TicketTable from '../../components/tickets/TicketTable';
import Button from '../../components/shared/Button';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const tickets = MOCK_TICKETS.filter(t => t.organisation?.name === user?.organisation?.name);

  const stats = {
    open: tickets.filter(t => t.status === 'open' || t.status === 'in_progress' || t.status === 'escalated').length,
    pending: tickets.filter(t => t.status === 'pending_customer').length,
    closed: tickets.filter(t => t.status === 'closed').length,
    escalated: tickets.filter(t => t.status === 'escalated').length,
  };

  return (
    <div>
      <PageHeader
        title="My Tickets"
        subtitle={`${user?.organisation?.name} — Support Portal`}
        breadcrumbs={['Portal', 'Tickets']}
        action={
          <Button icon={Plus} onClick={() => navigate('/customer/new')}>
            New Ticket
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Open Tickets" value={stats.open} icon={Ticket} />
        <StatCard label="Awaiting Response" value={stats.pending} icon={Clock} variant="warning" />
        <StatCard label="Escalated" value={stats.escalated} icon={AlertTriangle} variant="danger" />
        <StatCard label="Resolved" value={stats.closed} icon={CheckCircle} variant="success" />
      </div>

      <TicketTable tickets={tickets} loading={false} showOrg={false} basePath="/customer/tickets" />
    </div>
  );
}
