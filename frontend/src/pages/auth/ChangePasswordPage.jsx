import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Button from '../../components/shared/Button';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { markPasswordChanged } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required.';
    if (!form.newPassword) e.newPassword = 'New password is required.';
    if (form.newPassword.length < 8) e.newPassword = 'Password must be at least 8 characters.';
    if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');
    try {
      await api.post('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      markPasswordChanged();
      navigate('/customer');
    } catch (err) {
      setServerError(err.message || 'Failed to change password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#0F0F0F] mb-2">Change Password</h1>
        <p className="text-sm text-[#707070]">Set a new password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {serverError && (
          <div className="p-3 bg-[#FDE8E8] border border-[#FCA5A5] rounded-lg">
            <p className="text-sm text-[#C81E1E]">{serverError}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">
            Current Password
          </label>
          <input
            type="password"
            value={form.currentPassword}
            onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
            placeholder="Enter your current password"
            className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white text-[#0F0F0F] placeholder-[#999] transition-colors ${errors.currentPassword ? 'border-[#C81E1E]' : 'border-[#E0E2E6]'}`}
          />
          {errors.currentPassword && <p className="text-xs text-[#C81E1E] mt-1">{errors.currentPassword}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">
            New Password
          </label>
          <input
            type="password"
            value={form.newPassword}
            onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
            placeholder="Enter your new password"
            className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white text-[#0F0F0F] placeholder-[#999] transition-colors ${errors.newPassword ? 'border-[#C81E1E]' : 'border-[#E0E2E6]'}`}
          />
          {errors.newPassword && <p className="text-xs text-[#C81E1E] mt-1">{errors.newPassword}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">
            Confirm New Password
          </label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
            placeholder="Confirm your new password"
            className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/20 focus:border-[#01516A] bg-white text-[#0F0F0F] placeholder-[#999] transition-colors ${errors.confirmPassword ? 'border-[#C81E1E]' : 'border-[#E0E2E6]'}`}
          />
          {errors.confirmPassword && <p className="text-xs text-[#C81E1E] mt-1">{errors.confirmPassword}</p>}
        </div>

        <Button type="submit" loading={submitting} className="w-full">
          Change Password
        </Button>
      </form>
    </div>
  );
}
