import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', confirmClass = '', danger = false }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#5C5C5C] border border-[#E0E2E6] rounded-lg hover:bg-[#F5F5F5] transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${danger ? 'bg-[#C81E1E] hover:bg-[#a81a1a] text-white' : 'bg-[#01516A] hover:bg-[#0E465E] text-white'} ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-sm text-[#5C5C5C] leading-relaxed">{message}</p>
    </Modal>
  );
}
