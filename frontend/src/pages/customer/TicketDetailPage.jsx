import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import useTicket from '../../hooks/useTicket';
import { addComment } from '../../services/comments.service';
import { updateTicket, uploadAttachment } from '../../services/tickets.service';
import { getUsers } from '../../services/users.service';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:3001';
import StatusBadge from '../../components/shared/StatusBadge';
import PriorityBadge from '../../components/shared/PriorityBadge';
import SLAIndicator from '../../components/shared/SLAIndicator';
import TicketTimeline from '../../components/tickets/TicketTimeline';
import CommentBox from '../../components/tickets/CommentBox';
import EscalateButton from '../../components/tickets/EscalateButton';
import AttachmentUploader from '../../components/tickets/AttachmentUploader';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatDateTime } from '../../utils/dateUtils';

export default function TicketDetailPage({ isAgent = false }) {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { ticket, comments, attachments, loading, error, refetch } = useTicket(id);

  const [localStatus, setLocalStatus] = useState(null);
  const [localPriority, setLocalPriority] = useState(null);
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    if (isAgent) {
      getUsers({ role: 'agent', is_active: true })
        .then(res => setAgents(res.data || res.users || []))
        .catch(() => setAgents([]));
    }
  }, [isAgent]);

  const displayStatus = localStatus ?? ticket?.status;
  const displayPriority = localPriority ?? ticket?.priority;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" label="Loading ticket..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 bg-[#FDE8E8] border border-[#F8AEAE] rounded-lg text-sm text-[#C81E1E]">
        Failed to load ticket. Please go back and try again.
      </div>
    );
  }

  if (!ticket) return <div className="text-center py-20 text-[#999]">Ticket not found.</div>;

  const handleComment = async ({ body, is_internal }) => {
    try {
      await addComment(id, body, is_internal);
      await refetch();
      addToast('Your comment has been added.', 'success');
    } catch (err) {
      addToast(err?.message || 'Failed to add comment.', 'error');
    }
  };

  const handleSave = async () => {
    try {
      const updates = {};
      if (localStatus) updates.status = localStatus;
      if (localPriority) updates.priority = localPriority;
      if (!Object.keys(updates).length) return;
      await updateTicket(id, updates);
      await refetch();
      setLocalStatus(null);
      setLocalPriority(null);
      addToast('Ticket updated successfully.', 'success');
    } catch (err) {
      addToast(err?.message || 'Failed to update ticket.', 'error');
    }
  };

  const handleAttachment = async (files) => {
    if (!files.length) return;
    await Promise.all(files.map(f => uploadAttachment(id, f)));
    refetch();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
              <StatusBadge status={displayStatus} />
              <PriorityBadge priority={displayPriority} />
            </div>
            <h1 className="text-xl font-semibold text-[#0F0F0F] leading-snug">{ticket.subject}</h1>
            <p className="text-sm text-[#707070] mt-1">{ticket.organisation?.name}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <EscalateButton
              ticketId={id}
              currentPriority={displayPriority}
              status={displayStatus}
              onSuccess={() => {
                setLocalStatus(null);
                setLocalPriority(null);
                refetch();
              }}
            />
            {isAgent && (
              <div className="flex items-center gap-2">
                <select
                  value={displayStatus}
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
                  value={displayPriority}
                  onChange={e => setLocalPriority(e.target.value)}
                  className="text-sm border border-[#E0E2E6] rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white text-[#0F0F0F]"
                >
                  <option value="P1">P1 Critical</option>
                  <option value="P2">P2 High</option>
                  <option value="P3">P3 Normal</option>
                </select>
                <Button size="sm" onClick={handleSave}>Save</Button>
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
              <select
                value={ticket.assigned_to_id || ''}
                onChange={async (e) => {
                  try {
                    await updateTicket(id, { assigned_to_id: e.target.value || null });
                    await refetch();
                    addToast('Ticket assigned successfully.', 'success');
                  } catch (err) {
                    addToast('Failed to assign ticket.', 'error');
                  }
                }}
                className="text-sm border border-[#E0E2E6] rounded-md px-2 py-1 focus:outline-none focus:border-[#01516A] bg-white text-[#0F0F0F]"
              >
                <option value="">Unassigned</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}{agent.department?.name ? ` — ${agent.department.name}` : ''}
                  </option>
                ))}
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
          <div className="bg-white rounded-xl border border-[#E8EAED] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 className="text-sm font-semibold text-[#0F0F0F] mb-3">Attachments</h2>
            {attachments && attachments.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-xs font-medium text-[#707070] uppercase tracking-wide">
                  Uploaded Files
                </p>
                {attachments.map(att => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between px-3 py-2 bg-[#F9FAFB] border border-[#E0E2E6] rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-[#0F0F0F] truncate block">{att.original_name || att.filename}</span>
                      {att.file_size_bytes && (
                        <span className="text-xs text-[#999]">{formatFileSize(att.file_size_bytes)}</span>
                      )}
                    </div>
                    <a
                      href={`${API_BASE}/uploads/${att.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#01516A] hover:underline ml-3 shrink-0"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
            <AttachmentUploader onFilesChange={handleAttachment} />
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E8EAED] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 className="text-sm font-semibold text-[#0F0F0F] mb-3">Ticket Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-[#999] mb-0.5">Status</dt>
                <dd><StatusBadge status={displayStatus} /></dd>
              </div>
              <div>
                <dt className="text-xs text-[#999] mb-0.5">Priority</dt>
                <dd><PriorityBadge priority={displayPriority} /></dd>
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

          {displayStatus === 'closed' && (
            <div className="bg-[#EBF5FA] rounded-xl border border-[#D3ECFB] p-4">
              <p className="text-xs font-medium text-[#01516A] mb-1">Ticket Closed</p>
              <p className="text-xs text-[#609CB8] leading-relaxed">You can reopen this ticket by adding a reply within 5 business days.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
