import { useState } from 'react';
import { CircleArrowUp as ArrowUpCircle } from 'lucide-react';
import Modal from '../shared/Modal';
import { escalateTicket } from '../../services/tickets.service';

export default function EscalateButton({ ticketId, currentPriority, status, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [escalated, setEscalated] = useState(false);

  if (status === 'closed' || currentPriority === 'P1' || escalated) return null;

  const handleOpen = () => {
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
    setError('');
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      await escalateTicket(ticketId);
      setEscalated(true);
      setOpen(false);
      onSuccess();
    } catch (err) {
      setError(err?.message || 'Failed to escalate ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-[#C81E1E] text-[#C81E1E] rounded-lg hover:bg-[#FDE8E8] transition-colors"
      >
        <ArrowUpCircle className="w-4 h-4" />
        Escalate to Urgent
      </button>

      <Modal
        isOpen={open}
        onClose={handleClose}
        title="Escalate Ticket"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-[#5C5C5C] border border-[#E0E2E6] rounded-lg hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#C81E1E] hover:bg-[#a81a1a] text-white rounded-lg transition-colors disabled:opacity-60"
            >
              {loading && (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Yes, Escalate
            </button>
          </div>
        }
      >
        <p className="text-sm text-[#5C5C5C] leading-relaxed">
          このチケットを緊急対応に切り替えますか？ This will change the priority to P1 and alert all agents immediately.
        </p>
        {error && (
          <div className="mt-4 px-3 py-2.5 bg-[#FDE8E8] border border-[#F8AEAE] rounded-lg text-sm text-[#C81E1E]">
            {error}
          </div>
        )}
      </Modal>
    </>
  );
}
