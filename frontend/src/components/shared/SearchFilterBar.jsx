import { Search, SlidersHorizontal } from 'lucide-react';

export default function SearchFilterBar({ value, onChange, placeholder = 'Search...', filters, onFilterChange, filterValues = {} }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#E0E2E6] rounded-lg text-[#0F0F0F] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] transition-colors"
        />
      </div>
      {filters && filters.map(f => (
        <select
          key={f.key}
          value={filterValues[f.key] || ''}
          onChange={e => onFilterChange(f.key, e.target.value)}
          className="py-2 pl-3 pr-8 text-sm bg-white border border-[#E0E2E6] rounded-lg text-[#5C5C5C] focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] transition-colors appearance-none cursor-pointer"
        >
          <option value="">{f.label}</option>
          {f.options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ))}
    </div>
  );
}
