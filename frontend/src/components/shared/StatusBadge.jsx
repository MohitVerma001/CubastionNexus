import { STATUS_LABELS } from '../../utils/constants';

const STATUS_STYLES = {
  open: 'bg-[#D3ECFB] text-[#01516A]',
  in_progress: 'bg-[#A2CCE0] text-[#0E465E]',
  pending_customer: 'bg-[#FFF0D1] text-[#7A500F]',
  closed: 'bg-[#DFF7E8] text-[#057A55]',
  escalated: 'bg-[#FDE8E8] text-[#C81E1E]',
};

export default function StatusBadge({ status, size = 'sm' }) {
  const style = STATUS_STYLES[status] || 'bg-[#EBEBEB] text-[#5C5C5C]';
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${style} ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      {label}
    </span>
  );
}
