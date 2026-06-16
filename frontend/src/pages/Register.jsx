import { API_URL } from '../config';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plane, User, Lock, Mail, AlertCircle, ArrowLeft, Building2, UserSquare2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [department, setDepartment] = useState('Aerodynamics');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const departments = ['Aerodynamics', 'Propulsion', 'Avionics', 'Structural Design', 'Testing'];
  const roles = ['Employee', 'Engineer', 'Project Manager'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !department) {
      return setError('Please fill in all required fields.');
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, department })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Registration request logged! Redirecting to login portal...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Connection refused. Is the backend server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-6 lg:px-8 font-sans relative overflow-hidden select-none">
      
      {/* Background visuals */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="p-3 bg-sky-500/10 border border-sky-400/20 rounded-2xl mb-4">
            <Plane className="h-8 w-8 text-sky-400 rotate-45" />
          </div>
          <h2 className="text-center text-xl font-bold text-white tracking-wide leading-none">REGISTRATION GATEWAY</h2>
          <p className="mt-2 text-center text-xs text-slate-400 font-semibold tracking-widest uppercase">HAL Employee Onboarding Panel</p>
        </div>

        {/* Card Body */}
        <div className="bg-slate-950/80 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-900 rounded-lg text-xs text-red-400 flex items-start gap-2 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-900 rounded-lg text-xs text-emerald-400 flex items-start gap-2">
              <span className="h-2 w-2 mt-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Official Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  placeholder="e.g. Lt. Cdr. Arjun Nair"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Corporate Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  placeholder="arjun.nair@hal-india.co.in"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Access Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            {/* Grid for Department and Role */}
            <div className="grid grid-cols-2 gap-4">
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Department</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400 appearance-none"
                  >
                    {departments.map(d => (
                      <option key={d} value={d} className="bg-slate-950">{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Requested Role</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                    <UserSquare2 className="h-4 w-4" />
                  </span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400 appearance-none"
                  >
                    {roles.map(r => (
                      <option key={r} value={r} className="bg-slate-950">{r}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting Application...' : 'Send Access Request'}
            </button>
          </form>

          {/* Form navigation */}
          <div className="mt-5 text-center flex items-center justify-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5 text-slate-550" />
            <Link to="/login" className="text-[10px] text-sky-400 font-semibold hover:underline">Back to Login Gateway</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
