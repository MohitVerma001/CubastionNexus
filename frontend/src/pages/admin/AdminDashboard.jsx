import { Ticket, Building2, Users, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, TrendingUp } from 'lucide-react';
import { MOCK_TICKETS, MOCK_ORGANISATIONS, MOCK_USERS } from '../../utils/mockData';
import { getSLAStatus } from '../../utils/dateUtils';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import StatusBadge from '../../components/shared/StatusBadge';
import PriorityBadge from '../../components/shared/PriorityBadge';
import { formatRelative } from '../../utils/dateUtils';

export default function AdminDashboard() {
  const tickets = MOCK_TICKETS;

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    escalated: tickets.filter(t => t.status === 'escalated').length,
    slaRisk: tickets.filter(t => {
      const s = getSLAStatus(t.sla_resolution_due, t.sla_paused_at);
      return s === 'breached' || s === 'critical';
    }).length,
    resolved: tickets.filter(t => t.status === 'closed').length,
    orgs: MOCK_ORGANISATIONS.filter(o => o.is_active).length,
    agents: MOCK_USERS.filter(u => u.role === 'agent').length,
  };

  const recentTickets = tickets.slice(0, 5);
  const slaRiskTickets = tickets.filter(t => {
    const s = getSLAStatus(t.sla_resolution_due, t.sla_paused_at);
    return s === 'breached' || s === 'critical' || s === 'warning';
  });

  const orgStats = MOCK_ORGANISATIONS.slice(0, 5).map(org => ({
    ...org,
    open: tickets.filter(t => t.organisation?.name === org.name && t.status !== 'closed').length,
  }));

  return (
    <div>
      <PageHeader
        title="System Overview"
        subtitle="Platform health and support operations summary."
        breadcrumbs={['Admin', 'Dashboard']}
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Tickets" value={stats.total} icon={Ticket} variant="teal" trendLabel="+3 this week" />
        <StatCard label="Active Tickets" value={stats.open} icon={TrendingUp} />
        <StatCard label="SLA at Risk" value={stats.slaRisk} icon={AlertTriangle} variant={stats.slaRisk > 0 ? 'danger' : 'default'} />
        <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle} variant="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label="Organizations" value={stats.orgs} icon={Building2} />
        <StatCard label="Support Agents" value={stats.agents} icon={Users} />
        <StatCard label="Escalated" value={stats.escalated} icon={AlertTriangle} variant={stats.escalated > 0 ? 'danger' : 'default'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent tickets */}
        <div className="bg-white rounded-xl border border-[#E8EAED]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="px-5 py-4 border-b border-[#E8EAED]">
            <h2 className="text-sm font-semibold text-[#0F0F0F]">Recent Tickets</h2>
          </div>
          <div className="divide-y divide-[#F0F1F3]">
            {recentTickets.map(t => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#F5F8FA] transition-colors cursor-pointer">
                <span className="font-mono text-xs font-semibold text-[#01516A] w-20 shrink-0">{t.ticket_number}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#0F0F0F] truncate">{t.subject}</p>
                  <p className="text-xs text-[#999]">{t.organisation?.name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={t.priority} size="sm" />
                  <StatusBadge status={t.status} size="sm" />
                </div>
                <span className="text-xs text-[#999] shrink-0">{formatRelative(t.updated_at)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SLA risk */}
        <div className="bg-white rounded-xl border border-[#E8EAED]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="px-5 py-4 border-b border-[#E8EAED] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0F0F0F]">SLA Watchlist</h2>
            {slaRiskTickets.length > 0 && (
              <span className="text-xs font-medium text-[#C81E1E] bg-[#FDE8E8] px-2.5 py-0.5 rounded-full">{slaRiskTickets.length} at risk</span>
            )}
          </div>
          <div className="divide-y divide-[#F0F1F3]">
            {slaRiskTickets.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CheckCircle className="w-6 h-6 text-[#057A55] mx-auto mb-2" />
                <p className="text-sm text-[#999]">All tickets within SLA</p>
              </div>
            ) : slaRiskTickets.map(t => {
              const slaStatus = getSLAStatus(t.sla_resolution_due);
              return (
                <div key={t.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FFF8F8] transition-colors cursor-pointer">
                  <span className="font-mono text-xs font-semibold text-[#C81E1E] w-20 shrink-0">{t.ticket_number}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0F0F0F] truncate">{t.subject}</p>
                    <p className="text-xs text-[#999]">{t.organisation?.name}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${slaStatus === 'breached' ? 'bg-[#FDE8E8] text-[#C81E1E]' : 'bg-[#FFF0D1] text-[#DC9117]'}`}>
                    {slaStatus === 'breached' ? 'Breached' : 'At risk'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Org breakdown */}
      <div className="mt-4 bg-white rounded-xl border border-[#E8EAED]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="px-5 py-4 border-b border-[#E8EAED]">
          <h2 className="text-sm font-semibold text-[#0F0F0F]">Organization Ticket Load</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8EAED]">
                {['Organization', 'Total Tickets', 'Open', 'Contact', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-[#707070] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1F3]">
              {orgStats.map(org => (
                <tr key={org.id} className="hover:bg-[#F5F8FA] transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-[#0F0F0F]">{org.name}</td>
                  <td className="px-5 py-3.5 text-sm text-[#5C5C5C]">{org.ticket_count}</td>
                  <td className="px-5 py-3.5 text-sm text-[#5C5C5C]">
                    <span className={`font-semibold ${org.open > 3 ? 'text-[#C81E1E]' : 'text-[#0F0F0F]'}`}>{org.open}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#5C5C5C]">{org.primary_contact}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${org.is_active ? 'bg-[#DFF7E8] text-[#057A55]' : 'bg-[#F5F5F5] text-[#999]'}`}>
                      {org.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
