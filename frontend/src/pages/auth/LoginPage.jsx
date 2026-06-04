import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 700));
    const result = login(email, password);
    setLoading(false);
    if (result.role === 'customer') navigate('/customer');
    else if (result.role === 'admin') navigate('/admin');
    else navigate('/agent');
  };

  const fillDemo = (role) => {
    const demos = {
      customer: 'tanaka@fujikura.co.jp',
      agent: 'yamamoto@cubastion.com',
      admin: 'admin@cubastion.com',
    };
    setEmail(demos[role]);
    setPassword('password');
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#0F0F0F] tracking-tight">Welcome back</h2>
        <p className="text-sm text-[#707070] mt-1.5">Sign in to your Cubastion Nexus account</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-[#FDE8E8] border border-[#F8AEAE] rounded-lg text-sm text-[#C81E1E]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#0F0F0F] mb-1.5">Email address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@company.co.jp"
            autoComplete="email"
            className="w-full px-3.5 py-2.5 text-sm border border-[#E0E2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/25 focus:border-[#01516A] bg-white text-[#0F0F0F] placeholder-[#999] transition-colors"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-[#0F0F0F]">Password</label>
            <button type="button" className="text-xs text-[#01516A] hover:underline">Forgot password?</button>
          </div>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 pr-10 text-sm border border-[#E0E2E6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#01516A]/25 focus:border-[#01516A] bg-white text-[#0F0F0F] placeholder-[#999] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#5C5C5C]"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#01516A] hover:bg-[#0E465E] disabled:opacity-60 text-white font-medium text-sm rounded-lg transition-colors"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {/* Demo quick access */}
      <div className="mt-6 pt-5 border-t border-[#E8EAED]">
        <p className="text-xs text-[#999] mb-3 text-center">Demo access — click to fill credentials</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { role: 'customer', label: 'Customer', color: 'bg-[#EBF5FA] text-[#01516A] hover:bg-[#D3ECFB]' },
            { role: 'agent', label: 'Agent', color: 'bg-[#F5F5F5] text-[#5C5C5C] hover:bg-[#EBEBEB]' },
            { role: 'admin', label: 'Admin', color: 'bg-[#FFF0D1] text-[#7A500F] hover:bg-[#FFE3AB]' },
          ].map(d => (
            <button
              key={d.role}
              type="button"
              onClick={() => fillDemo(d.role)}
              className={`py-2 text-xs font-medium rounded-lg transition-colors ${d.color}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
