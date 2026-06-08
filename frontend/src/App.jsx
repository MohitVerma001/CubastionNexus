import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';

import LoginPage from './pages/auth/LoginPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerTicketDetail from './pages/customer/TicketDetailPage';
import NewTicketPage from './pages/customer/NewTicketPage';
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentTickets from './pages/agent/AgentTickets';
import AgentTicketDetail from './pages/agent/AgentTicketDetailPage';
import AgentNewTicketPage from './pages/agent/AgentNewTicketPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTickets from './pages/admin/AdminTickets';
import UsersPage from './pages/admin/UsersPage';
import OrganizationsPage from './pages/admin/OrganizationsPage';
import SLAConfigPage from './pages/admin/SLAConfigPage';
import AuditLogPage from './pages/admin/AuditLogPage';
import SettingsPage from './pages/admin/SettingsPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';

function RequireAuth({ children, allowedRoles }) {
  const { user, mustChangePassword } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (mustChangePassword) return <Navigate to="/change-password" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'customer') return <Navigate to="/customer" replace />;
    if (user.role === 'agent') return <Navigate to="/agent" replace />;
    return <Navigate to="/admin" replace />;
  }
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'customer') return <Navigate to="/customer" replace />;
  if (user.role === 'agent') return <Navigate to="/agent" replace />;
  return <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />

            {/* Auth */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />
            </Route>

            {/* Customer */}
            <Route element={<RequireAuth allowedRoles={['customer']}><AppLayout /></RequireAuth>}>
              <Route path="/customer" element={<CustomerDashboard />} />
              <Route path="/customer/new" element={<NewTicketPage />} />
              <Route path="/customer/tickets/:id" element={<CustomerTicketDetail />} />
            </Route>

            {/* Agent */}
            <Route element={<RequireAuth allowedRoles={['agent', 'admin']}><AppLayout /></RequireAuth>}>
              <Route path="/agent" element={<AgentDashboard />} />
              <Route path="/agent/tickets" element={<AgentTickets />} />
              <Route path="/agent/tickets/new" element={<AgentNewTicketPage />} />
              <Route path="/agent/tickets/:id" element={<AgentTicketDetail />} />
            </Route>

            {/* Admin */}
            <Route element={<RequireAuth allowedRoles={['admin']}><AppLayout /></RequireAuth>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/tickets" element={<AdminTickets />} />
              <Route path="/admin/tickets/:id" element={<AgentTicketDetail />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/admin/organizations" element={<OrganizationsPage />} />
              <Route path="/admin/departments" element={<DepartmentsPage />} />
              <Route path="/admin/sla" element={<SLAConfigPage />} />
              <Route path="/admin/audit" element={<AuditLogPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
