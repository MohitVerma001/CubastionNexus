import { Clock, Pause } from 'lucide-react';
import { getSLAStatus, formatDateTime } from '../../utils/dateUtils';

const SLA_STYLES = {
  breached: { text: 'text-[#C81E1E]', bg: 'bg-[#FDE8E8]', label: 'Breached' },
  critical: { text: 'text-[#DC9117]', bg: 'bg-[#FFF0D1]', label: 'Critical' },
  warning: { text: 'text-[#DC9117]', bg: 'bg-[#FFF0D1]', label: 'Warning' },
  paused: { text: 'text-[#999999]', bg: 'bg-[#F5F5F5]', label: 'Paused' },
  normal: { text: 'text-[#01516A]', bg: 'bg-[#EBF5FA]', label: 'On Track' },
};

export default function SLAIndicator({ dueAt, pausedAt, showDate = true }) {
  const status = getSLAStatus(dueAt, pausedAt);
  const s = SLA_STYLES[status];
  if (!dueAt) return <span className="text-xs text-[#999]">—</span>;
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 ${s.bg}`}>
      {pausedAt
        ? <Pause className={`w-3 h-3 ${s.text}`} />
        : <Clock className={`w-3 h-3 ${s.text}`} />}
      <span className={`text-xs font-medium ${s.text}`}>
        {showDate ? formatDateTime(dueAt) : s.label}
      </span>
    </div>
  );
}
