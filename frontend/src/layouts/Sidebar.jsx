import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, Building2, Users, Users2, Shield,
  FileText, Settings, LogOut, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/shared/UserAvatar';

const AGENT_NAV = [
  { to: '/agent', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/agent/tickets', icon: Ticket, label: 'All Tickets' },
];

const ADMIN_NAV = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/tickets', icon: Ticket, label: 'Tickets' },
  { to: '/admin/organizations', icon: Building2, label: 'Organizations' },
  { to: '/admin/departments', icon: Users2, label: 'Departments' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/sla', icon: Shield, label: 'SLA Config' },
  { to: '/admin/audit', icon: FileText, label: 'Audit Logs' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

const CUSTOMER_NAV = [
  { to: '/customer', icon: LayoutDashboard, label: 'My Tickets', end: true },
  { to: '/customer/new', icon: Ticket, label: 'New Ticket' },
];

function NavItem({ to, icon: Icon, label, collapsed, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg transition-all duration-150 group relative ${collapsed ? 'px-3 py-2.5 justify-center' : 'px-3 py-2.5'} ${isActive ? 'bg-[#01516A] text-white' : 'text-[#A2CCE0] hover:bg-[#0E465E] hover:text-white'}`
      }
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#0F0F0F] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
          {label}
        </div>
      )}
    </NavLink>
  );
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = user?.role === 'admin' ? ADMIN_NAV : user?.role === 'agent' ? AGENT_NAV : CUSTOMER_NAV;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onMobileClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-40 flex flex-col bg-[#002C3B] transition-all duration-200
        ${collapsed ? 'w-16' : 'w-56'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className={`flex items-center gap-2 px-4 h-14 border-b border-[#0E465E] shrink-0 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-lg bg-[#01516A] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">CN</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white text-sm font-semibold leading-none">Cubastion</p>
              <p className="text-[#609CB8] text-xs mt-0.5">Nexus</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll py-3 px-2 flex flex-col gap-0.5">
          {navItems.map(item => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>

        {/* User + Collapse */}
        <div className="border-t border-[#0E465E] p-2 space-y-1 shrink-0">
          {!collapsed && user && (
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
              <UserAvatar name={user.name} size="sm" />
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-[#609CB8] truncate capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[#A2CCE0] hover:bg-[#0E465E] hover:text-white transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="text-sm">Sign out</span>}
          </button>
          <button
            onClick={onToggle}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-lg text-[#609CB8] hover:bg-[#0E465E] hover:text-white transition-colors justify-center"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
