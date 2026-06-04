import UserAvatar from '../shared/UserAvatar';
import { formatDateTime } from '../../utils/dateUtils';
import { Lock, Mail } from 'lucide-react';

export default function TicketTimeline({ comments, currentUserId }) {
  if (!comments || !comments.length) {
    return <p className="text-sm text-[#999] italic py-4 text-center">No activity yet.</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const isInternal = comment.is_internal;
        const isAgent = comment.author.role === 'agent' || comment.author.role === 'admin';
        const isOwn = comment.author.id === currentUserId;

        return (
          <div
            key={comment.id}
            className={`rounded-xl border p-4 ${
              isInternal
                ? 'bg-[#FFF8E6] border-[#FFE3AB] border-dashed'
                : isAgent
                ? 'bg-[#EBF5FA] border-[#D3ECFB]'
                : 'bg-white border-[#E8EAED]'
            }`}
          >
            <div className="flex items-start gap-3">
              <UserAvatar name={comment.author.name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-sm font-semibold text-[#0F0F0F]">{comment.author.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${isAgent ? 'bg-[#D3ECFB] text-[#01516A]' : 'bg-[#EBEBEB] text-[#5C5C5C]'}`}>
                    {comment.author.role}
                  </span>
                  {isInternal && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#FFE3AB] text-[#7A500F] font-medium">
                      <Lock className="w-2.5 h-2.5" />
                      Internal note
                    </span>
                  )}
                  {comment.source === 'email' && (
                    <span className="flex items-center gap-1 text-xs text-[#999]">
                      <Mail className="w-3 h-3" />
                      Email
                    </span>
                  )}
                  <span className="text-xs text-[#999] ml-auto">{formatDateTime(comment.created_at)}</span>
                </div>
                <p className="text-sm text-[#0F0F0F] leading-relaxed whitespace-pre-wrap">{comment.body}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
