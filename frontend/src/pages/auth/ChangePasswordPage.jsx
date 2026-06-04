import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../services/auth.service';
import { validatePasswordForm } from '../../utils/validators';

export default function ChangePasswordPage() {
  const { user, markPasswordChanged } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, getValues, formState: { errors }, setError } = useForm();
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const toggleShow = (field) => setShow(prev => ({ ...prev, [field]: !prev[field] }));

  const onSubmit = async (data) => {
    const { valid, errors: validationErrors } = validatePasswordForm({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });

    if (!valid) {
      Object.entries(validationErrors).forEach(([field, message]) => {
        setError(field, { message });
      });
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      await changePassword(data.currentPassword, data.newPassword);
      markPasswordChanged();
      if (user?.role === 'customer') navigate('/customer');
      else if (user?.role === 'admin') navigate('/admin');
      else navigate('/agent');
    } catch (err) {
      setServerError(err?.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError) =>
    `w-full px-3.5 py-2.5 pr-10 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/25 focus:border-[#01516A] bg-white text-[#0F0F0F] placeholder-[#999] transition-colors ${hasError ? 'border-[#C81E1E]' : 'border-[#E0E2E6]'}`;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#0F0F0F] tracking-tight">Set your password</h2>
        <p className="text-sm text-[#707070] mt-1.5">You must set a new password before continuing</p>
      </div>

      {serverError && (
        <div className="mb-4 px-4 py-3 bg-[#FDE8E8] border border-[#F8AEAE] rounded-lg text-sm text-[#C81E1E]">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">Current Password</label>
          <div className="relative">
            <input
              type={show.current ? 'text' : 'password'}
              placeholder="Enter your current password"
              autoComplete="current-password"
              className={inputClass(!!errors.currentPassword)}
              {...register('currentPassword')}
            />
            <button
              type="button"
              onClick={() => toggleShow('current')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#5C5C5C]"
            >
              {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-xs text-[#C81E1E] mt-1">{errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">New Password</label>
          <div className="relative">
            <input
              type={show.new ? 'text' : 'password'}
              placeholder="Enter your new password"
              autoComplete="new-password"
              className={inputClass(!!errors.newPassword)}
              {...register('newPassword')}
            />
            <button
              type="button"
              onClick={() => toggleShow('new')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#5C5C5C]"
            >
              {show.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-[#C81E1E] mt-1">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">Confirm New Password</label>
          <div className="relative">
            <input
              type={show.confirm ? 'text' : 'password'}
              placeholder="Confirm your new password"
              autoComplete="new-password"
              className={inputClass(!!errors.confirmPassword)}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => toggleShow('confirm')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#5C5C5C]"
            >
              {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-[#C81E1E] mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#01516A] hover:bg-[#0E465E] disabled:opacity-60 text-white font-medium text-sm rounded-lg transition-colors"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
