import { API_URL } from '../config';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { ScrollText, Search, ShieldCheck, Clock, Terminal } from 'lucide-react';

export default function AuditLogs() {
  const { token } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [token]);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/auditlogs', {
        headers: { 'Authorization': `Bearer ${ token }` }
      });
      if (res.ok) {
        const list = await res.json();
        setLogs(list);
      }
    } catch (err) {
      console.error('Failed to load audit trail logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const term = search.toLowerCase();
    return log.action.toLowerCase().includes(term) || 
           log.userName.toLowerCase().includes(term) ||
           log.details.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-slate-850 dark:text-white">Security Audit Trail</h2>
        <p className="text-xs text-slate-500 font-light mt-1">Immutable registry of employee entries, document uploads, and SLA escalation alerts.</p>
      </div>

      {/* Toolbar search */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter logs by operator name, action details, or operation types..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-450 focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
          />
        </div>
      </div>

      {/* Grid Audit Log list */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 dark:bg-slate-950/20 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-5 py-3">Operator ID</th>
                <th className="px-5 py-3">Action logged</th>
                <th className="px-5 py-3">Operation Details</th>
                <th className="px-5 py-3">Security IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-hal-navy border-t-transparent dark:border-sky-400 dark:border-t-transparent mx-auto"></div>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id || log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-sky-400" />
                        <span>{new Date(log.createdAt || log.timestamp).toLocaleString()}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-200">
                      <span>{log.userName}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 font-light max-w-sm truncate dark:text-slate-405" title={log.details}>
                      {log.details}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-[9px] flex items-center gap-1">
                      <Terminal className="h-3.5 w-3.5 text-slate-400" />
                      <span>{log.ipAddress}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                    No matching audit operations logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
