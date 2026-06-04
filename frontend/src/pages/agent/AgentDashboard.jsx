import { Ticket, TriangleAlert as AlertTriangle, UserX, Clock, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_TICKETS } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import { getSLAStatus } from '../../utils/dateUtils';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import TicketTable from '../../components/tickets/TicketTable';
import Button from '../../components/shared/Button';

export default function AgentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const tickets = MOCK_TICKETS;

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    p1Risk: tickets.filter(t => {
      const s = getSLAStatus(t.sla_resolution_due, t.sla_paused_at);
      return s === 'breached' || s === 'critical';
    }).length,
    unassigned: tickets.filter(t => !t.assigned_to && t.status !== 'closed').length,
    pending: tickets.filter(t => t.status === 'pending_customer').length,
    escalated: tickets.filter(t => t.status === 'escalated').length,
  };

  return (
    <div>
      <PageHeader
        title="Agent Dashboard"
        subtitle={`Signed in as ${user?.name}`}
        breadcrumbs={['Agent Portal', 'Dashboard']}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={RefreshCw} size="sm">Refresh</Button>
            <Button icon={Plus} onClick={() => navigate('/agent/tickets/new')}>
              Create Ticket
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Open" value={stats.open} icon={Ticket} variant="teal" />
        <StatCard label="SLA Risk" value={stats.p1Risk} icon={AlertTriangle} variant="danger" trendLabel="Requires attention" />
        <StatCard label="Unassigned" value={stats.unassigned} icon={UserX} variant="warning" />
        <StatCard label="Pending Customer" value={stats.pending} icon={Clock} />
        <StatCard label="Escalated" value={stats.escalated} icon={AlertTriangle} variant="danger" />
      </div>

      <TicketTable tickets={tickets} loading={false} showOrg={true} basePath="/agent/tickets" />
    </div>
  );
}
