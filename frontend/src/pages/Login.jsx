import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { AuthContext } from '../App';
import { Plane, Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { label: 'Admin (ID)', email: 'admin', pass: 'admin123', desc: 'System Administrator' },
    { label: 'Admin (Email)', email: 'admin@halbrain.com', pass: 'admin123', desc: 'System Administrator' },
    { label: 'Project Mgr', email: 'HAL-2026-0002', pass: 'pm123', desc: 'Dr. Vivek Murthy' },
    { label: 'Engineer', email: 'HAL-2026-0003', pass: 'eng123', desc: 'Sanjay Rawat' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please enter both email and password.');
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid login credentials.');
      }
    } catch (err) {
      setError('Connection refused. Is the backend server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-6 lg:px-8 font-sans relative overflow-hidden select-none">

      {/* Background visual cues */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">

        {/* Portal Header */}
        <div className="flex flex-col items-center">
          <div className="p-3 bg-sky-500/10 border border-sky-400/20 rounded-2xl mb-4">
            <Plane className="h-8 w-8 text-sky-400 rotate-45" />
          </div>
          <h2 className="text-center text-xl font-bold text-white tracking-wide leading-none">HAL's BRAIN GATEWAY</h2>
          <p className="mt-2 text-center text-xs text-slate-400 font-semibold tracking-widest uppercase">HAL SECURITY CLEARANCE REQUIRED</p>
        </div>

        {/* Card Panel */}
        <div className="bg-slate-950/80 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-900 rounded-lg text-xs text-red-400 flex items-start gap-2 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email/Employee ID Field */}
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Security ID (Email or Employee ID)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                  placeholder="e.g. admin or employee@hal-india.co.in"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Access Token (Password)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Decrypting Workspace...' : 'Authenticate'}
            </button>
          </form>
        </div>

        {/* Demo Fast Login panel */}
        <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-sky-400 uppercase tracking-widest border-b border-slate-900 pb-2">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Fast-Track Demo Credentials</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map(acc => (
              <button
                key={acc.label}
                onClick={() => handleFillDemo(acc)}
                className="p-2.5 bg-slate-900 hover:bg-slate-855 rounded-xl border border-slate-850 hover:border-slate-800 text-left transition-all group"
              >
                <div className="text-[10px] font-bold text-slate-200 group-hover:text-sky-400">{acc.label}</div>
                <div className="text-[9px] text-slate-500 mt-1 font-light leading-none truncate">{acc.desc}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
