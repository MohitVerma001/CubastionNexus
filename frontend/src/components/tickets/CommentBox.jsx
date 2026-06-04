import { useState } from 'react';
import { Send, Lock, Paperclip } from 'lucide-react';
import Button from '../shared/Button';

export default function CommentBox({ onSubmit, showInternalToggle = false, placeholder = 'Write your reply...' }) {
  const [body, setBody] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true);
    await onSubmit({ body: body.trim(), is_internal: isInternal });
    setBody('');
    setSubmitting(false);
  };

  return (
    <div className={`rounded-xl border overflow-hidden transition-colors ${isInternal ? 'border-[#FFE3AB] bg-[#FFFBF0]' : 'border-[#E8EAED] bg-white'}`}>
      {showInternalToggle && (
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#E8EAED] bg-[#FAFAFA]">
          <button
            onClick={() => setIsInternal(false)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full transition-colors ${!isInternal ? 'bg-[#01516A] text-white' : 'text-[#707070] hover:bg-[#EBEBEB]'}`}
          >
            Reply to customer
          </button>
          <button
            onClick={() => setIsInternal(true)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full transition-colors ${isInternal ? 'bg-[#DC9117] text-white' : 'text-[#707070] hover:bg-[#EBEBEB]'}`}
          >
            <Lock className="w-3 h-3" />
            Internal note
          </button>
        </div>
      )}
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder={isInternal ? 'Write an internal note (not visible to customer)...' : placeholder}
        rows={4}
        className="w-full px-4 py-3 text-sm text-[#0F0F0F] placeholder-[#999] bg-transparent resize-none focus:outline-none"
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(); }}
      />
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#E8EAED]">
        <button className="text-[#999] hover:text-[#5C5C5C] transition-colors">
          <Paperclip className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#999]">Ctrl+Enter to send</span>
          <Button
            icon={Send}
            onClick={handleSubmit}
            loading={submitting}
            disabled={!body.trim()}
            variant={isInternal ? 'accent' : 'primary'}
            size="sm"
          >
            {isInternal ? 'Save note' : 'Send reply'}
          </Button>
        </div>
      </div>
    </div>
  );
}
