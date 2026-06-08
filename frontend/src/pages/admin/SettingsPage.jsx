import { useState } from 'react';
import { Settings, Bell, Mail, Shield, Globe } from 'lucide-react';
import useOrganisations from '../../hooks/useOrganisations';
import { updateOrganisation } from '../../services/organisations.service';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/shared/PageHeader';

const SECTIONS = [
  {
    icon: Bell,
    title: 'Notification Settings',
    description: 'Configure email and in-app notification preferences.',
    items: [
      { label: 'Email on new ticket', enabled: true },
      { label: 'Email on P1 escalation', enabled: true },
      { label: 'Email on SLA breach warning', enabled: true },
      { label: 'Daily digest summary', enabled: false },
    ],
  },
  {
    icon: Mail,
    title: 'Email Configuration',
    description: 'Inbound email routing and sending configuration.',
    items: [
      { label: 'Inbound email processing', enabled: true },
      { label: 'Email threading', enabled: true },
      { label: 'Auto-create tickets from email', enabled: true },
    ],
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Authentication and access control settings.',
    items: [
      { label: 'Two-factor authentication required', enabled: false },
      { label: 'Session timeout (1 hour)', enabled: true },
      { label: 'Login attempt lockout', enabled: true },
    ],
  },
];

function EmailRoutingSection() {
  const { organisations, loading, refetch } = useOrganisations();
  const [editingId, setEditingId] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const { addToast } = useToast();

  const handleSave = async (orgId) => {
    try {
      await updateOrganisation(orgId, { inbound_email: editEmail });
      setEditingId(null);
      refetch();
      addToast('Email routing updated.', 'success');
    } catch {
      addToast('Failed to update email routing.', 'error');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#E8EAED] overflow-hidden"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E8EAED]">
        <div className="w-8 h-8 rounded-lg bg-[#EBF5FA] flex items-center justify-center">
          <Mail className="w-4 h-4 text-[#01516A]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#0F0F0F]">Email Routing</p>
          <p className="text-xs text-[#707070]">
            Map inbound email addresses to organisations.
            Emails sent to these addresses create tickets automatically.
          </p>
        </div>
      </div>
      <div className="divide-y divide-[#F0F1F3]">
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-[#999]">
            Loading organisations...
          </div>
        ) : organisations.map(org => (
          <div key={org.id}
            className="flex items-center justify-between px-5 py-3.5 gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#0F0F0F]">{org.name}</p>
              {editingId === org.id ? (
                <input
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  placeholder="support.company@cubastion.com"
                  className="mt-1 w-full px-3 py-1.5 text-sm border border-[#E0E2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white"
                />
              ) : (
                <p className="text-xs text-[#609CB8] mt-0.5">
                  {org.inbound_email || <span className="text-[#999] italic">No email configured</span>}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {editingId === org.id ? (
                <>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs text-[#707070] px-3 py-1.5 border border-[#E0E2E6] rounded-lg hover:bg-[#F5F5F5]">
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave(org.id)}
                    className="text-xs text-white bg-[#01516A] hover:bg-[#0E465E] px-3 py-1.5 rounded-lg">
                    Save
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setEditingId(org.id);
                    setEditEmail(org.inbound_email || '');
                  }}
                  className="text-xs text-[#01516A] px-3 py-1.5 border border-[#D3ECFB] bg-[#EBF5FA] rounded-lg hover:bg-[#D3ECFB]">
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Settings"
        subtitle="Platform configuration and preferences."
        breadcrumbs={['Admin', 'Settings']}
      />

      <div className="space-y-4">
        <EmailRoutingSection />

        {SECTIONS.map(section => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="bg-white rounded-xl border border-[#E8EAED] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E8EAED]">
                <div className="w-8 h-8 rounded-lg bg-[#EBF5FA] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[#01516A]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0F0F0F]">{section.title}</p>
                  <p className="text-xs text-[#707070]">{section.description}</p>
                </div>
              </div>
              <div className="divide-y divide-[#F0F1F3]">
                {section.items.map(item => (
                  <div key={item.label} className="flex items-center justify-between px-5 py-3.5">
                    <span className="text-sm text-[#0F0F0F]">{item.label}</span>
                    <button
                      className={`relative w-10 h-5 rounded-full transition-colors ${item.enabled ? 'bg-[#01516A]' : 'bg-[#D0D3DA]'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
