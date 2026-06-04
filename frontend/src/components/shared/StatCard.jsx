import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, trend, trendLabel, accent = false, variant = 'default' }) {
  const VARIANTS = {
    default: { card: 'bg-white border border-[#E8EAED]', icon: 'bg-[#EBF5FA] text-[#01516A]' },
    warning: { card: 'bg-[#FFF8E6] border border-[#FFE3AB]', icon: 'bg-[#FFE3AB] text-[#DC9117]' },
    danger: { card: 'bg-[#FFF5F5] border border-[#FCA5A5]', icon: 'bg-[#FDE8E8] text-[#C81E1E]' },
    success: { card: 'bg-[#F3FDF6] border border-[#BBF7D0]', icon: 'bg-[#DFF7E8] text-[#057A55]' },
    teal: { card: 'bg-[#01516A] border border-[#01516A]', icon: 'bg-white/20 text-white' },
  };
  const v = VARIANTS[variant] || VARIANTS.default;
  const isNegativeTrend = trend < 0;

  return (
    <div className={`rounded-xl p-5 ${v.card}`} style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${variant === 'teal' ? 'text-[#A2CCE0]' : 'text-[#999]'}`}>{label}</p>
          <p className={`text-3xl font-semibold tracking-tight ${variant === 'teal' ? 'text-white' : 'text-[#0F0F0F]'}`}>{value}</p>
          {trendLabel && (
            <div className={`flex items-center gap-1 mt-2 ${isNegativeTrend ? 'text-[#C81E1E]' : 'text-[#057A55]'}`}>
              {isNegativeTrend ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              <span className="text-xs">{trendLabel}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${v.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
