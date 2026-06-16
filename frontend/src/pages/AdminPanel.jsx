import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import {
  ShieldAlert,
  Users,
  ShieldCheck,
  Mail,
  Building,
  UserCircle2,
  Check,
  X,
  UserCheck,
  Key,
  Info
} from 'lucide-react';

export default function AdminPanel() {
  const { token, user } = useContext(AuthContext);
  const [usersList, setUsersList] = useState([]);
  const [requestsList, setRequestsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('directory'); // directory, requests
  const [generatedCreds, setGeneratedCreds] = useState(null); // { employeeId, tempPassword, email }

  const roles = ['Administrator', 'Project Manager', 'Engineer', 'Employee'];

  useEffect(() => {
    fetchUsers();
    fetchRequests();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/users', {
        headers: { 'Authorization': `Bearer ${ token }` }
      });
      if (res.ok) {
        const list = await res.json();
        setUsersList(list);
      }
    } catch (err) {
      console.error('Failed to load user directory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${ API_URL } / auth / access - requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    if (res.ok) {
      const list = await res.json();
      setRequestsList(list);
    }
  } catch (err) {
    console.error('Failed to load access requests:', err);
  }
};

const handleChangeRole = async (userId, newRole) => {
  setMessage('');
  setError('');
  setGeneratedCreds(null);

  if (userId === user.id) {
    return setError('For safety reasons, you cannot modify your own administration rights.');
  }

  try {
    const res = await fetch(`/api/auth/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role: newRole })
    });

    if (res.ok) {
      setMessage('User credentials configuration successfully updated.');
      fetchUsers();
    } else {
      const d = await res.json();
      setError(d.message || 'Failed to update user role.');
    }
  } catch (err) {
    setError('Connection with safety node refused.');
  }
};

const handleApprove = async (id, email) => {
  setMessage('');
  setError('');
  setGeneratedCreds(null);
  try {
    const res = await fetch(`/api/auth/access-requests/${id}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (res.ok) {
      setGeneratedCreds({
        employeeId: data.employeeId,
        tempPassword: data.tempPassword,
        email
      });
      setMessage(`Access request successfully approved for ${email}.`);
      fetchRequests();
      fetchUsers();
    } else {
      setError(data.message || 'Failed to approve access request.');
    }
  } catch (err) {
    setError('Security database connection error.');
  }
};

const handleReject = async (id) => {
  setMessage('');
  setError('');
  setGeneratedCreds(null);
  try {
    const res = await fetch(`/api/auth/access-requests/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (res.ok) {
      setMessage('Access request successfully rejected.');
      fetchRequests();
    } else {
      const data = await res.json();
      setError(data.message || 'Failed to reject access request.');
    }
  } catch (err) {
    setError('Security database connection error.');
  }
};

// Filter requests depending on pending status
const pendingRequests = requestsList.filter(r => r.status === 'pending');

return (
  <div className="space-y-6 max-w-7xl mx-auto select-none font-sans">

    {/* Header */}
    <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
      <h2 className="text-xl font-bold tracking-tight text-slate-850 dark:text-white">User Directory & Onboarding</h2>
      <p className="text-xs text-slate-500 font-light mt-1">Configure credentials scopes, access authorization levels, and approve onboarding requests.</p>
    </div>

    {/* Tabs */}
    <div className="flex border-b border-slate-150 dark:border-slate-800 gap-6">
      <button
        onClick={() => { setActiveTab('directory'); setGeneratedCreds(null); }}
        className={`pb-2.5 font-bold text-xs transition-all relative ${activeTab === 'directory'
            ? 'text-sky-400 font-extrabold border-b-2 border-sky-400'
            : 'text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
      >
        User Directory ({usersList.length})
      </button>
      <button
        onClick={() => { setActiveTab('requests'); setGeneratedCreds(null); }}
        className={`pb-2.5 font-bold text-xs transition-all relative flex items-center gap-1.5 ${activeTab === 'requests'
            ? 'text-sky-400 font-extrabold border-b-2 border-sky-400'
            : 'text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
      >
        <span>Access Applications</span>
        {pendingRequests.length > 0 && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-500 text-slate-950 font-black">
            {pendingRequests.length}
          </span>
        )}
      </button>
    </div>

    {/* Message banners */}
    {message && (
      <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
        <ShieldCheck className="h-4.5 w-4.5" />
        <span>{message}</span>
      </div>
    )}

    {error && (
      <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-xs text-red-400 flex items-center gap-2">
        <ShieldAlert className="h-4.5 w-4.5 animate-pulse" />
        <span>{error}</span>
      </div>
    )}

    {/* Approve Credentials Output Details */}
    {generatedCreds && (
      <div className="p-5 bg-sky-500/10 border border-sky-400/25 rounded-2xl text-xs text-slate-800 dark:text-slate-200 space-y-3 shadow-lg shadow-sky-500/5">
        <div className="flex items-center gap-2 border-b border-sky-400/20 pb-2">
          <Key className="h-4.5 w-4.5 text-sky-400" />
          <span className="font-extrabold uppercase tracking-wider text-sky-400">Onboarding Credentials Hydrated</span>
        </div>
        <p className="font-light">Convey the following generated credentials to the onboarding employee:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300">
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest mb-1">Official Email</span>
            <span className="text-white font-semibold select-all">{generatedCreds.email}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest mb-1">Employee ID</span>
            <span className="text-white font-semibold select-all">{generatedCreds.employeeId}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest mb-1">Temp Password</span>
            <span className="text-sky-400 font-bold select-all">{generatedCreds.tempPassword}</span>
          </div>
        </div>
        <div className="flex items-start gap-2 text-[10px] text-slate-450 italic">
          <Info className="h-4 w-4 text-sky-400 shrink-0" />
          <span>Note: The employee must log in using these temporary credentials and change their password in the secure activation sandbox.</span>
        </div>
      </div>
    )}

    {/* Directory Tab View */}
    {activeTab === 'directory' && (
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 dark:bg-slate-950/20 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Employee Name</th>
                <th className="px-5 py-3">Employee ID</th>
                <th className="px-5 py-3">Security Mail</th>
                <th className="px-5 py-3">Division</th>
                <th className="px-5 py-3">Assigned Privilege Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-hal-navy border-t-transparent dark:border-sky-400 dark:border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : usersList.length > 0 ? (
                usersList.map(item => (
                  <tr key={item.id || item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <UserCircle2 className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-500 dark:text-slate-400">
                      {item.employeeId || 'N/A (Legacy)'}
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono flex items-center gap-1.5 dark:text-slate-400">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{item.email}</span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-light dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Building className="h-3.5 w-3.5 text-sky-400" />
                        <span>{item.department}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={item.role}
                        onChange={(e) => handleChangeRole(item.id || item._id, e.target.value)}
                        className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300"
                      >
                        {roles.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                    No accounts registered in system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* Access Requests Tab View */}
    {activeTab === 'requests' && (
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 dark:bg-slate-950/20 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Applicant Name</th>
                <th className="px-5 py-3">Security Mail</th>
                <th className="px-5 py-3">Requested Division & Role</th>
                <th className="px-5 py-3">Justification</th>
                <th className="px-5 py-3">Onboarding Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {requestsList.length > 0 ? (
                requestsList.map(item => (
                  <tr key={item.id || item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2">
                        <UserCircle2 className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-550 font-mono dark:text-slate-450">
                      {item.email}
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-light dark:text-slate-400">
                      <div className="space-y-0.5">
                        <span className="block font-semibold text-slate-700 dark:text-slate-300">{item.department}</span>
                        <span className="block text-[10px] text-slate-400">Scope: {item.role}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-light max-w-xs dark:text-slate-400 leading-normal italic">
                      "{item.reason || 'No justification provided.'}"
                    </td>
                    <td className="px-5 py-4">
                      {item.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(item._id || item.id, item.email)}
                            className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-bold text-[10px] rounded-lg shadow-sm flex items-center gap-1 transition-colors"
                            title="Approve onboarding request"
                          >
                            <Check className="h-3 w-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(item._id || item.id)}
                            className="px-2.5 py-1.5 bg-red-500 hover:bg-red-450 text-slate-950 font-bold text-[10px] rounded-lg shadow-sm flex items-center gap-1 transition-colors"
                            title="Reject onboarding request"
                          >
                            <X className="h-3 w-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${item.status === 'approved' ? 'text-emerald-500' : 'text-red-500'
                          }`}>
                          {item.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                    No onboarding access requests found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}

  </div>
);
}
