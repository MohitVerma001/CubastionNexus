import { ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

export default function DataTable({
  columns,
  data,
  loading,
  emptyTitle = 'No data',
  emptyDescription = 'No records found.',
  onRowClick,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalCount,
  pageSize = 25,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead>
            <tr className="border-b border-[#E8EAED]">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-[#707070] uppercase tracking-wider whitespace-nowrap ${col.headerClass || ''}`}
                  style={col.width ? { width: col.width } : {}}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && <ChevronsUpDown className="w-3 h-3 opacity-50" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F1F3]">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <div className="py-12">
                    <EmptyState title={emptyTitle} description={emptyDescription} />
                  </div>
                </td>
              </tr>
            ) : data.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`group transition-colors ${onRowClick ? 'cursor-pointer hover:bg-[#F5F8FA]' : ''}`}
              >
                {columns.map(col => (
                  <td key={col.key} className={`px-4 py-3.5 text-sm ${col.cellClass || ''}`}>
                    {col.render ? col.render(row[col.key], row) : (
                      <span className="text-[#0F0F0F]">{row[col.key] ?? '—'}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E8EAED]">
          <p className="text-xs text-[#999]">
            {totalCount ? `${((currentPage - 1) * pageSize) + 1}–${Math.min(currentPage * pageSize, totalCount)} of ${totalCount}` : `Page ${currentPage} of ${totalPages}`}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-md hover:bg-[#EBEBEB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[#5C5C5C]" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${p === currentPage ? 'bg-[#01516A] text-white' : 'hover:bg-[#EBEBEB] text-[#5C5C5C]'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-md hover:bg-[#EBEBEB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-[#5C5C5C]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
