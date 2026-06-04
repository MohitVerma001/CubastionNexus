import { useState } from 'react';
import { Search, Bell, Menu, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/shared/UserAvatar';
import { useNavigate } from 'react-router-dom';

export default function Header({ onMobileMenuOpen, sidebarCollapsed = false, notificationCount = 3 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const NOTIFICATIONS = [
    { id: 1, text: 'CUB-00142 has been escalated to P1', time: '5m ago', unread: true },
    { id: 2, text: 'New reply on CUB-00138 from Tanaka', time: '1h ago', unread: true },
    { id: 3, text: 'SLA breach warning: CUB-00135', time: '2h ago', unread: false },
  ];

  return (
    <header className={`fixed top-0 right-0 left-0 z-20 h-14 bg-white border-b border-[#E8EAED] flex items-center px-4 gap-4 transition-all duration-200 ${sidebarCollapsed ? 'lg:left-16' : 'lg:left-56'}`}>
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden p-2 rounded-lg hover:bg-[#EBEBEB] text-[#707070]"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-xs hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" />
        <input
          type="text"
          placeholder="Search tickets..."
          className="w-full pl-9 pr-4 py-1.5 text-sm bg-[#F5F6F8] border border-[#E8EAED] rounded-lg placeholder-[#999] focus:outline-none focus:bg-white focus:border-[#01516A] focus:ring-1 focus:ring-[#01516A]/20 transition-all"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative p-2 rounded-lg hover:bg-[#EBEBEB] text-[#707070] hover:text-[#0F0F0F] transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#DC9117] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {notificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-[#E8EAED] shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E8EAED] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#0F0F0F]">Notifications</h3>
                <button className="text-xs text-[#01516A] hover:underline">Mark all read</button>
              </div>
              <div className="divide-y divide-[#F0F1F3] max-h-72 overflow-y-auto">
                {NOTIFICATIONS.map(n => (
                  <div key={n.id} className={`px-4 py-3 hover:bg-[#F5F8FA] cursor-pointer transition-colors ${n.unread ? 'bg-[#EBF5FA]/40' : ''}`}>
                    <div className="flex items-start gap-2">
                      {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#01516A] mt-1.5 shrink-0" />}
                      {!n.unread && <span className="w-1.5 h-1.5 shrink-0" />}
                      <div>
                        <p className="text-xs text-[#0F0F0F] leading-snug">{n.text}</p>
                        <p className="text-xs text-[#999] mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-[#E8EAED]">
                <button className="text-xs text-[#01516A] hover:underline w-full text-center">View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-[#EBEBEB] transition-colors"
          >
            <UserAvatar name={user?.name} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-[#0F0F0F] leading-none">{user?.name}</p>
              <p className="text-xs text-[#999] mt-0.5 capitalize">{user?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#999]" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-[#E8EAED] shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#E8EAED]">
                <p className="text-xs font-semibold text-[#0F0F0F]">{user?.name}</p>
                <p className="text-xs text-[#999]">{user?.email}</p>
              </div>
              <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-sm text-[#5C5C5C] hover:bg-[#F5F6F8] transition-colors">Profile</button>
                <button className="w-full text-left px-4 py-2 text-sm text-[#5C5C5C] hover:bg-[#F5F6F8] transition-colors">Settings</button>
                <hr className="my-1 border-[#E8EAED]" />
                <button onClick={() => { logout(); navigate('/login'); }} className="w-full text-left px-4 py-2 text-sm text-[#C81E1E] hover:bg-[#FDE8E8] transition-colors">Sign out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
