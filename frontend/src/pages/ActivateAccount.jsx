import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Plane, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function ActivateAccount() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      return setError('Please enter and confirm your new password.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/activate-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: password })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Password updated and account activated! Redirecting to login gateway...');
        setTimeout(() => {
          logout(); // Clear token and log out
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to activate account.');
      }
    } catch (err) {
      setError('Connection failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(13,64,116,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,64,116,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="p-3 bg-blue-50 border border-blue-200/50 rounded-2xl mb-4">
            <Plane className="h-8 w-8 text-blue-650 rotate-45" />
          </div>
          <h2 className="text-center text-xl font-bold text-slate-800 tracking-tight">Activate Your Account</h2>
          <p className="mt-2 text-center text-xs text-slate-400 font-semibold tracking-widest uppercase">HAL's BRAIN Security Protocol</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl shadow-slate-100">
          
          <div className="mb-6 text-xs text-slate-605 leading-relaxed bg-slate-50 border border-slate-150 p-4 rounded-2xl font-light">
            <span className="font-bold text-slate-800 block mb-1">Security Activation Notice</span>
            You have authenticated with a <strong className="font-semibold text-slate-800">Temporary Access Password</strong>. To activate your operational profile, you must set a permanent security password.
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-650 flex items-start gap-2">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-650 flex items-start gap-2">
              <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* New Password */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">New Security Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                  placeholder="Re-type password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 text-white font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Securing Account...' : 'Set Password & Activate'}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
}
