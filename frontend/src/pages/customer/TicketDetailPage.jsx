import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TriangleAlert as AlertTriangle, Tag, Calendar } from 'lucide-react';
import { MOCK_TICKETS, MOCK_COMMENTS } from '../../utils/mockData';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/shared/PageHeader';
import StatusBadge from '../../components/shared/StatusBadge';
import PriorityBadge from '../../components/shared/PriorityBadge';
import SLAIndicator from '../../components/shared/SLAIndicator';
import TicketTimeline from '../../components/tickets/TicketTimeline';
import CommentBox from '../../components/tickets/CommentBox';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Button from '../../components/shared/Button';
import { formatDateTime } from '../../utils/dateUtils';

export default function TicketDetailPage({ isAgent = false }) {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const ticket = MOCK_TICKETS.find(t => t.id === id) || MOCK_TICKETS[0];
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [showEscalate, setShowEscalate] = useState(false);
  const [localStatus, setLocalStatus] = useState(ticket?.status);
  const [localPriority, setLocalPriority] = useState(ticket?.priority);

  if (!ticket) return <div className="text-center py-20 text-[#999]">Ticket not found.</div>;

  const handleComment = async ({ body, is_internal }) => {
    setComments(prev => [...prev, {
      id: `c-${Date.now()}`,
      author: { name: user.name, role: user.role },
      body, is_internal,
      created_at: new Date().toISOString(),
      source: 'portal',
    }]);
  };

  const basePath = isAgent ? '/agent/tickets' : '/customer/tickets';
  const backPath = isAgent ? '/agent' : '/customer';

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center gap-1.5 text-sm text-[#707070] hover:text-[#01516A] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to tickets
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-[#E8EAED] p-6 mb-4" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-xs font-semibold text-[#01516A] bg-[#EBF5FA] px-2.5 py-1 rounded-md">{ticket.ticket_number}</span>
              <StatusBadge status={localStatus} />
              <PriorityBadge priority={localPriority} />
            </div>
            <h1 className="text-xl font-semibold text-[#0F0F0F] leading-snug">{ticket.subject}</h1>
            <p className="text-sm text-[#707070] mt-1">{ticket.organisation?.name}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {ticket.status !== 'escalated' && ticket.status !== 'closed' && (
              <Button
                variant="danger"
                icon={AlertTriangle}
                size="sm"
                onClick={() => setShowEscalate(true)}
              >
                Escalate
              </Button>
            )}
            {isAgent && (
              <div className="flex items-center gap-2">
                <select
                  value={localStatus}
                  onChange={e => setLocalStatus(e.target.value)}
                  className="text-sm border border-[#E0E2E6] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white text-[#0F0F0F]"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending_customer">Pending Customer</option>
                  <option value="closed">Closed</option>
                  <option value="escalated">Escalated</option>
                </select>
                <select
                  value={localPriority}
                  onChange={e => setLocalPriority(e.target.value)}
                  className="text-sm border border-[#E0E2E6] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white text-[#0F0F0F]"
                >
                  <option value="P1">P1 Critical</option>
                  <option value="P2">P2 High</option>
                  <option value="P3">P3 Normal</option>
                </select>
                <Button size="sm">Save</Button>
              </div>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-5 pt-5 border-t border-[#E8EAED] grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-[#999] uppercase tracking-wide mb-1">Category</p>
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#609CB8]" />
              <span className="text-sm text-[#5C5C5C] capitalize">{(ticket.category || 'other').replace(/_/g, ' ')}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-[#999] uppercase tracking-wide mb-1">Created</p>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#609CB8]" />
              <span className="text-sm text-[#5C5C5C]">{formatDateTime(ticket.created_at || new Date().toISOString())}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-[#999] uppercase tracking-wide mb-1">Assigned To</p>
            {isAgent ? (
              <select className="text-sm border border-[#E0E2E6] rounded-md px-2 py-1 focus:outline-none focus:border-[#01516A] bg-white text-[#0F0F0F]">
                <option value="">Unassigned</option>
                <option value="u-002" selected={ticket.assigned_to?.name === 'Yamamoto K.'}>Yamamoto K.</option>
                <option value="u-005">Nakamura A.</option>
              </select>
            ) : (
              <span className="text-sm text-[#5C5C5C]">{ticket.assigned_to?.name || 'Unassigned'}</span>
            )}
          </div>
          <div>
            <p className="text-xs text-[#999] uppercase tracking-wide mb-1">SLA Deadline</p>
            <SLAIndicator dueAt={ticket.sla_resolution_due} showDate={true} />
          </div>
        </div>
      </div>

      {/* Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-[#E8EAED] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 className="text-sm font-semibold text-[#0F0F0F] mb-4">Conversation</h2>
            <TicketTimeline comments={comments} currentUserId={user?.id} />
          </div>
          <div className="bg-white rounded-xl border border-[#E8EAED] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 className="text-sm font-semibold text-[#0F0F0F] mb-3">{isAgent ? 'Reply or Add Note' : 'Add Reply'}</h2>
            <CommentBox onSubmit={handleComment} showInternalToggle={isAgent} />
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E8EAED] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 className="text-sm font-semibold text-[#0F0F0F] mb-3">Ticket Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-[#999] mb-0.5">Status</dt>
                <dd><StatusBadge status={localStatus} /></dd>
              </div>
              <div>
                <dt className="text-xs text-[#999] mb-0.5">Priority</dt>
                <dd><PriorityBadge priority={localPriority} /></dd>
              </div>
              <div>
                <dt className="text-xs text-[#999] mb-0.5">Organization</dt>
                <dd className="text-sm text-[#0F0F0F]">{ticket.organisation?.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#999] mb-0.5">Last updated</dt>
                <dd className="text-sm text-[#5C5C5C]">{formatDateTime(ticket.updated_at)}</dd>
              </div>
            </dl>
          </div>

          {localStatus === 'closed' && (
            <div className="bg-[#EBF5FA] rounded-xl border border-[#D3ECFB] p-4">
              <p className="text-xs font-medium text-[#01516A] mb-1">Ticket Closed</p>
              <p className="text-xs text-[#609CB8] leading-relaxed">You can reopen this ticket by adding a reply within 5 business days.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showEscalate}
        onClose={() => setShowEscalate(false)}
        onConfirm={() => setLocalStatus('escalated')}
        title="Escalate Ticket"
        message="Escalating this ticket will set it to P1 Critical priority and immediately notify the support team. Are you sure you want to escalate?"
        confirmLabel="Escalate Now"
        danger={true}
      />
    </div>
  );
}
