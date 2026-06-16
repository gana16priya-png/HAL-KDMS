import { API_URL } from '../config';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plane, User, Mail, AlertCircle, ArrowLeft, Building2, UserSquare2, Sparkles, MessageCircle } from 'lucide-react';
import { divisionsList } from '../utils/divisions';

export default function RequestAccess() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Aircraft Division');
  const [role, setRole] = useState('Employee');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = ['Employee', 'Engineer', 'Project Manager'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !department || !role || !reason) {
      return setError('Please fill in all details and provide a justification.');
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, department, role, reason })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Access request submitted successfully! An administrator will review your application.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to submit request.');
      }
    } catch (err) {
      setError('Connection with HAL security gateway refused. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Aesthetic grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(13,64,116,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,64,116,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

      <div className="max-w-lg w-full space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center">
          <div className="p-3 bg-blue-50 border border-blue-200/50 rounded-2xl mb-4">
            <Plane className="h-8 w-8 text-blue-600 rotate-45" />
          </div>
          <h2 className="text-center text-2xl font-extrabold text-slate-800 tracking-tight">Request System Access</h2>
          <p className="mt-2 text-center text-xs text-slate-400 font-semibold tracking-widest uppercase">HAL's BRAIN Onboarding Registry</p>
        </div>

        {/* Form panel */}
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xl shadow-slate-100">
          
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-4 bg-emerald-50 border border-emerald-250 rounded-xl text-xs text-emerald-600 flex items-start gap-2">
              <Sparkles className="h-4.5 w-4.5 shrink-0 text-emerald-500 animate-pulse" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Employee Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="e.g. Lt. Cdr. Arjun Nair"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Official Mail Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="arjun.nair@hal-india.co.in"
                />
              </div>
            </div>

            {/* Selector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">HAL Division</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="block w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none"
                  >
                    {divisionsList.map(div => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Requested Role</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <UserSquare2 className="h-4 w-4" />
                  </span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none"
                  >
                    {roles.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Justification Text area */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Justification for Access</label>
              <div className="relative">
                <span className="absolute top-3 left-3.5 flex items-center text-slate-400 pointer-events-none">
                  <MessageCircle className="h-4 w-4" />
                </span>
                <textarea
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="Specify why you require access to HAL's BRAIN (e.g. Flight testing review, engine thermography logs analysis)..."
                ></textarea>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting Application...' : 'Send Access Request'}
            </button>
          </form>

          {/* Form navigation */}
          <div className="mt-5 text-center flex items-center justify-center gap-1.5 text-xs">
            <ArrowLeft className="h-4 w-4 text-slate-400" />
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Back to Secure Login</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
