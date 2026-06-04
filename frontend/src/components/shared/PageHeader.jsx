import { ChevronRight } from 'lucide-react';

export default function PageHeader({ title, subtitle, breadcrumbs, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 mb-1.5">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3 text-[#999]" />}
                <span className={`text-xs ${i === breadcrumbs.length - 1 ? 'text-[#5C5C5C]' : 'text-[#999] cursor-pointer hover:text-[#01516A]'}`}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-xl font-semibold text-[#0F0F0F] tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-[#707070] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
