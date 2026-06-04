import { Inbox, Search, Bell } from 'lucide-react';

const ICONS = {
  inbox: Inbox,
  search: Search,
  notification: Bell,
};

export default function EmptyState({ title, description, icon = 'inbox', action }) {
  const Icon = ICONS[icon] || Inbox;
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#EBF5FA] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[#609CB8]" />
      </div>
      <h3 className="text-sm font-semibold text-[#0F0F0F] mb-1">{title}</h3>
      <p className="text-sm text-[#707070] max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
