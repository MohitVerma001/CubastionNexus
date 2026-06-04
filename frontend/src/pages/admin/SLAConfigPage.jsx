import { useState } from 'react';
import { Save, Info } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSLAConfigs, updateSLAConfig } from '../../services/admin.service';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { formatDateTime } from '../../utils/dateUtils';

const PRIORITY_META = {
  P1: { label: 'P1 — Critical', desc: 'System down or critical business impact. Immediate escalation.', dot: 'bg-[#DC9117]', bg: 'bg-[#FFF0D1]' },
  P2: { label: 'P2 — High', desc: 'Major functionality impaired. No immediate workaround available.', dot: 'bg-[#F9A41E]', bg: 'bg-[#FFF8E6]' },
  P3: { label: 'P3 — Normal', desc: 'Minor issues or general requests. Business continues with workaround.', dot: 'bg-[#999]', bg: 'bg-[#F5F5F5]' },
};

function SLARow({ config, onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const [firstResponse, setFirstResponse] = useState(config.first_response_hours);
  const [resolution, setResolution] = useState(config.resolution_hours);
  const meta = PRIORITY_META[config.priority];

  const handleSave = () => {
    onSave(config.id, { first_response_hours: Number(firstResponse), resolution_hours: Number(resolution) });
    setEditing(false);
  };

  return (
    <div className={`rounded-xl border p-5 ${meta.bg} border-[#E0E2E6]`}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3 flex-1">
          <span className={`w-3 h-3 rounded-full mt-1 shrink-0 ${meta.dot}`} />
          <div>
            <p className="text-sm font-semibold text-[#0F0F0F]">{meta.label}</p>
            <p className="text-xs text-[#707070] mt-0.5 max-w-xs">{meta.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          <div className="text-center">
            <p className="text-xs text-[#999] uppercase tracking-wide mb-1.5">First Response</p>
            {editing ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={firstResponse}
                  onChange={e => setFirstResponse(e.target.value)}
                  min="0.5" step="0.5"
                  className="w-16 px-2 py-1.5 text-sm text-center border border-[#E0E2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white"
                />
                <span className="text-xs text-[#707070]">hrs</span>
              </div>
            ) : (
              <p className="text-xl font-semibold text-[#0F0F0F]">{config.first_response_hours}<span className="text-xs text-[#999] font-normal ml-0.5">hrs</span></p>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-[#999] uppercase tracking-wide mb-1.5">Resolution</p>
            {editing ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={resolution}
                  onChange={e => setResolution(e.target.value)}
                  min="1" step="1"
                  className="w-16 px-2 py-1.5 text-sm text-center border border-[#E0E2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white"
                />
                <span className="text-xs text-[#707070]">hrs</span>
              </div>
            ) : (
              <p className="text-xl font-semibold text-[#0F0F0F]">{config.resolution_hours}<span className="text-xs text-[#999] font-normal ml-0.5">hrs</span></p>
            )}
          </div>

          <div>
            {editing ? (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                <Button icon={Save} size="sm" loading={saving} onClick={handleSave}>Save</Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-[#999] mt-3">Last updated: {formatDateTime(config.updated_at)}</p>
    </div>
  );
}

export default function SLAConfigPage() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['sla-configs'],
    queryFn: getSLAConfigs,
  });

  const configs = data?.configs ?? data ?? [];

  const saveMutation = useMutation({
    mutationFn: ({ id, data: payload }) => updateSLAConfig(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla-configs'] });
      addToast('SLA configuration saved.', 'success');
    },
    onError: (err) => {
      addToast(err?.response?.data?.message || 'Failed to save SLA configuration.', 'error');
    },
  });

  const handleSave = (id, payload) => {
    saveMutation.mutate({ id, data: payload });
  };

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="SLA Configuration"
        subtitle="Configure response and resolution time targets by priority level."
        breadcrumbs={['Admin', 'SLA Config']}
      />

      <div className="bg-[#EBF5FA] border border-[#D3ECFB] rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#01516A] mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-[#01516A]">Business Hours Policy</p>
          <p className="text-xs text-[#609CB8] mt-0.5">All SLA timers run during business hours: Monday–Friday, 09:00–18:00 JST. Japanese national holidays are excluded. Timers pause when a ticket status is set to "Pending Customer".</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" label="Loading SLA configuration..." />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {configs.map(config => (
              <SLARow key={config.id} config={config} onSave={handleSave} saving={saveMutation.isPending} />
            ))}
          </div>

          <div className="mt-6 bg-white rounded-xl border border-[#E8EAED] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 className="text-sm font-semibold text-[#0F0F0F] mb-3">SLA Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E8EAED]">
                    <th className="text-left py-2 text-xs font-semibold text-[#707070] uppercase tracking-wide">Priority</th>
                    <th className="text-center py-2 text-xs font-semibold text-[#707070] uppercase tracking-wide">First Response</th>
                    <th className="text-center py-2 text-xs font-semibold text-[#707070] uppercase tracking-wide">Resolution</th>
                    <th className="text-center py-2 text-xs font-semibold text-[#707070] uppercase tracking-wide">Resolution (Days)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F1F3]">
                  {configs.map(c => (
                    <tr key={c.id}>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${PRIORITY_META[c.priority]?.dot}`} />
                          <span className="font-medium text-[#0F0F0F]">{c.priority}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center text-[#5C5C5C]">{c.first_response_hours}h</td>
                      <td className="py-3 text-center text-[#5C5C5C]">{c.resolution_hours}h</td>
                      <td className="py-3 text-center text-[#5C5C5C]">~{(c.resolution_hours / 8).toFixed(1)} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
