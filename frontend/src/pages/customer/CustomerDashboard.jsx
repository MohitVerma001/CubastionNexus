import { Ticket, Clock, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Plus, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useTickets from '../../hooks/useTickets';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import TicketTable from '../../components/tickets/TicketTable';
import Button from '../../components/shared/Button';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tickets, loading, error } = useTickets();

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
        subtitle={user?.organisation?.name
          ? `${user.organisation.name} — Support Portal`
          : 'Support Portal'}
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

      {error ? (
        user?.organisation_id
          ? (
            <div className="px-4 py-3 bg-[#FDE8E8] border border-[#F8AEAE] rounded-lg text-sm text-[#C81E1E]">
              Failed to load tickets. Please refresh the page.
            </div>
          )
          : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-[#EBF5FA] flex items-center justify-center mb-4 mx-auto">
                <Building2 className="w-8 h-8 text-[#01516A]" />
              </div>
              <h2 className="text-lg font-semibold text-[#0F0F0F] mb-2">
                No Organisation Assigned
              </h2>
              <p className="text-sm text-[#707070] max-w-sm">
                Your account is not associated with an organisation.
                Please contact your administrator to get access.
              </p>
              <p className="text-xs text-[#999] mt-2">{user?.email}</p>
            </div>
          )
      ) : (
        <TicketTable tickets={tickets} loading={loading} showOrg={false} basePath="/customer/tickets" />
      )}
    </div>
  );
}
