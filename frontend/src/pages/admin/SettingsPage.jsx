import PageHeader from '../../components/shared/PageHeader';
import { Settings, Bell, Mail, Shield, Globe } from 'lucide-react';

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

export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Settings"
        subtitle="Platform configuration and preferences."
        breadcrumbs={['Admin', 'Settings']}
      />

      <div className="space-y-4">
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
