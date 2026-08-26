import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { BrandLogo } from '../../components/BrandLogo';

interface AdminLoginProps {
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToStore }) => {
  const { login, loading } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    const success = await login({ username: username.trim(), password: password.trim() });
    if (!success) {
      setError('Invalid admin username or password. Access denied.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#2C1810] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Sacred Gold Auric Background Elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 px-4">
        <button
          onClick={onBackToStore}
          className="inline-flex items-center space-x-1.5 text-xs text-[#7A1F1D] hover:text-[#993300] mb-4 font-bold transition-colors cursor-pointer bg-white/80 px-3 py-1.5 rounded-full border border-[#EADBCA] shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </button>

        <div className="flex items-center justify-center mx-auto mb-2">
          <BrandLogo size="lg" customUrl="/indima-logo.svg" />
        </div>

        <h2 className="mt-3 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2C1810]">
          Indima Spice Co.
        </h2>
        <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-[#993300] uppercase tracking-widest font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Secure Admin Portal</span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-[#EADBCA]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#4A3B32] uppercase tracking-wider mb-1.5">
                Admin Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C6D53] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full pl-10 pr-3 py-2.5 bg-[#FAF6EE] border border-[#D9C4A2] rounded-xl text-xs text-[#2C1810] placeholder-neutral-400 focus:outline-hidden focus:border-[#993300] focus:ring-1 focus:ring-[#993300]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-[#4A3B32] uppercase tracking-wider">
                  Admin Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-[#993300] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8C6D53] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FAF6EE] border border-[#D9C4A2] rounded-xl text-xs text-[#2C1810] font-mono placeholder-neutral-400 focus:outline-hidden focus:border-[#993300] focus:ring-1 focus:ring-[#993300]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="admin-login-submit-btn"
              className="w-full py-3 px-4 rounded-xl bg-[#993300] hover:bg-[#7A1F1D] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Admin Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#EADBCA] text-center">
            <p className="text-[11px] text-[#7A5B43] flex items-center justify-center gap-1">
              <Lock className="w-3 h-3 text-[#993300]" />
              <span>Encrypted Session • Authorized Admin Access Only</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
