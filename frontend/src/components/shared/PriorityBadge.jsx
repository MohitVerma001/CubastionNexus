const PRIORITY_STYLES = {
  P1: { dot: 'bg-[#DC9117]', text: 'text-[#DC9117]', bg: 'bg-[#FFF0D1]', label: 'P1 Critical' },
  P2: { dot: 'bg-[#F9A41E]', text: 'text-[#F9A41E]', bg: 'bg-[#FFF8E6]', label: 'P2 High' },
  P3: { dot: 'bg-[#999999]', text: 'text-[#707070]', bg: 'bg-[#F5F5F5]', label: 'P3 Normal' },
};

export default function PriorityBadge({ priority, size = 'sm' }) {
  const s = PRIORITY_STYLES[priority] || PRIORITY_STYLES.P3;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${s.bg} ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} shrink-0`} />
      <span className={s.text}>{s.label}</span>
    </span>
  );
}
