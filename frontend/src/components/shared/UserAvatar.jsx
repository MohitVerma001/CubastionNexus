const COLORS = [
  'bg-[#D3ECFB] text-[#01516A]',
  'bg-[#FFF0D1] text-[#7A500F]',
  'bg-[#DFF7E8] text-[#057A55]',
  'bg-[#FDE8E8] text-[#C81E1E]',
  'bg-[#EBF5FA] text-[#0E465E]',
];

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getColor(name) {
  const idx = (name || '').charCodeAt(0) % COLORS.length;
  return COLORS[idx];
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
};

export default function UserAvatar({ name, size = 'sm' }) {
  return (
    <div className={`rounded-full flex items-center justify-center font-semibold shrink-0 ${getColor(name)} ${SIZE_CLASSES[size]}`}>
      {getInitials(name)}
    </div>
  );
}
