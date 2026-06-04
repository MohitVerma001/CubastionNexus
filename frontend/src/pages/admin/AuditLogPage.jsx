import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '../../services/admin.service';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import SearchFilterBar from '../../components/shared/SearchFilterBar';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';
import { formatDateTime } from '../../utils/dateUtils';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const ACTION_STYLES = {
  status_changed: 'bg-[#D3ECFB] text-[#01516A]',
  assigned: 'bg-[#DFF7E8] text-[#057A55]',
  priority_changed: 'bg-[#FFF0D1] text-[#7A500F]',
  closed: 'bg-[#F5F5F5] text-[#5C5C5C]',
  comment_added: 'bg-[#EBF5FA] text-[#609CB8]',
  escalated: 'bg-[#FDE8E8] text-[#C81E1E]',
};

const PAGE_SIZE = 25;

export default function AuditLogPage() {
  const [filters, setFilters] = useState({ page: 1, limit: PAGE_SIZE });
  const [search, setSearch] = useState('');

  const updateFilter = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value || undefined, page: 1 }));

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => getAuditLogs(filters),
    keepPreviousData: true,
  });

  const logs = data?.logs ?? data?.items ?? (Array.isArray(data) ? data : []);
  const total = data?.total ?? logs.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = filters.page ?? 1;

  const filtered = search
    ? logs.filter(l =>
        l.ticket_number?.toLowerCase().includes(search.toLowerCase()) ||
        l.actor?.toLowerCase().includes(search.toLowerCase()) ||
        l.action?.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  const ACTION_FILTER_OPTIONS = [
    { value: 'status_changed', label: 'Status Changed' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'priority_changed', label: 'Priority Changed' },
    { value: 'closed', label: 'Closed' },
    { value: 'comment_added', label: 'Comment Added' },
    { value: 'escalated', label: 'Escalated' },
  ];

  const columns = [
    {
      key: 'created_at',
      label: 'Timestamp',
      width: '170px',
      render: v => <span className="text-xs text-[#5C5C5C] font-mono">{formatDateTime(v)}</span>,
    },
    {
      key: 'ticket_number',
      label: 'Ticket',
      width: '110px',
      render: v => v ? <span className="font-mono text-xs font-semibold text-[#01516A]">{v}</span> : '—',
    },
    {
      key: 'action',
      label: 'Action',
      width: '160px',
      render: v => (
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${ACTION_STYLES[v] || 'bg-[#F5F5F5] text-[#5C5C5C]'}`}>
          {(v || '').replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'old_value',
      label: 'Change',
      render: (v, row) => (
        <div className="flex items-center gap-2 text-xs text-[#5C5C5C]">
          {v && <span className="px-1.5 py-0.5 bg-[#F5F5F5] rounded text-[#999] line-through">{v}</span>}
          {v && row.new_value && <ArrowRight className="w-3 h-3 text-[#999] shrink-0" />}
          {row.new_value && <span className="px-1.5 py-0.5 bg-[#EBF5FA] rounded text-[#01516A]">{row.new_value}</span>}
        </div>
      ),
    },
    {
      key: 'actor',
      label: 'Actor',
      width: '160px',
      render: v => <span className="text-sm text-[#0F0F0F]">{v}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle="Read-only record of all system actions and changes."
        breadcrumbs={['Admin', 'Audit Log']}
      />

      <div className="bg-white rounded-xl border border-[#E8EAED] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="px-4 py-4 border-b border-[#E8EAED] flex flex-wrap items-center gap-3">
          <SearchFilterBar
            value={search}
            onChange={setSearch}
            placeholder="Search logs..."
            filters={[
              { key: 'action', label: 'All Actions', options: ACTION_FILTER_OPTIONS },
            ]}
            onFilterChange={(k, v) => updateFilter(k, v)}
            filterValues={filters}
          />
          <input
            type="date"
            value={filters.from_date || ''}
            onChange={e => updateFilter('from_date', e.target.value)}
            className="py-2 px-3 text-sm bg-white border border-[#E0E2E6] rounded-lg text-[#5C5C5C] focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] transition-colors"
          />
          <input
            type="date"
            value={filters.to_date || ''}
            onChange={e => updateFilter('to_date', e.target.value)}
            className="py-2 px-3 text-sm bg-white border border-[#E0E2E6] rounded-lg text-[#5C5C5C] focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] transition-colors"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" label="Loading audit logs..." />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            emptyTitle="No audit logs"
            emptyDescription="No events found for your search."
          />
        )}

        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-[#E8EAED] flex items-center justify-between">
            <p className="text-xs text-[#999]">
              Page {currentPage} of {totalPages} — {total} total events
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={ChevronLeft}
                disabled={currentPage <= 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
