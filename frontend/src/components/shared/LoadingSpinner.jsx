export default function LoadingSpinner({ size = 'md', label = 'Loading...' }) {
  const sz = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size];
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sz} border-2 border-[#D3ECFB] border-t-[#01516A] rounded-full animate-spin`} />
      {label && <span className="text-xs text-[#999]">{label}</span>}
    </div>
  );
}
