import { API_URL } from '../config';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import {
  FolderGit2,
  FolderCheck,
  Clock,
  AlertOctagon,
  CheckCircle2,
  FileCheck,
  Activity,
  ArrowRight,
  TrendingUp,
  Milestone,
  CheckSquare,
  Square,
  AlertTriangle,
  Calendar,
  Sparkles,
  HelpCircle,
  FileText
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lists for feed/widgets
  const [decisions, setDecisions] = useState([]);
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);

  // Interactive local task lists
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchAllData();
    if (user?.role === 'Administrator') {
      fetchLogs();
    }
  }, [token, user]);

  // Seed role-based tasks once user metadata loads
  useEffect(() => {
    if (user) {
      const defaultTasks = {
        'Administrator': [
          { id: 1, text: 'Review pending employee onboarding applications', done: false },
          { id: 2, text: 'Examine security audit trail logs for temp passwords', done: false },
          { id: 3, text: 'Audit latest database compliance schemas', done: true }
        ],
        'Project Manager': [
          { id: 1, text: 'Update progress alignments on delayed program nodes', done: false },
          { id: 2, text: 'Approve or reject pending design decision logs', done: false },
          { id: 3, text: 'Inspect SLA ticket triggers for engine testing defects', done: false }
        ],
        'Engineer': [
          { id: 1, text: 'Verify stress parameters for Titanium nozzle mount assembly', done: false },
          { id: 2, text: 'Log wind tunnel calibration outcomes', done: true },
          { id: 3, text: 'Ask AI Chat about carbon composite stress tolerances', done: false }
        ]
      };
      setTasks(defaultTasks[user.role] || [
        { id: 1, text: 'Verify active division project tasks checklist', done: false },
        { id: 2, text: 'Consult HAL AI on division guidelines', done: false }
      ]);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${API_URL}/analytics/dashboard', {
        headers: { 'Authorization': `Bearer ${ token }` }
      });
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      const [decRes, projRes, issRes] = await Promise.all([
        fetch(`${ API_URL } / decisions`, { headers: { 'Authorization': `Bearer ${ token }` } }),
        fetch(`${ API_URL } / projects`, { headers: { 'Authorization': `Bearer ${ token }` } }),
        fetch(`${ API_URL } / issues`, { headers: { 'Authorization': `Bearer ${ token }` } })
      ]);
      if (decRes.ok) setDecisions(await decRes.json());
      if (projRes.ok) setProjects(await projRes.json());
      if (issRes.ok) setIssues(await issRes.json());
    } catch (err) {
      console.error('Failed fetching aggregated lists:', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${ API_URL } / auditlogs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    if (res.ok) {
      const logsData = await res.json();
      setLogs(logsData.slice(0, 4));
    }
  } catch (err) {
    console.error('Failed to load audit logs:', err);
  }
};

const toggleTask = (id) => {
  setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
};

if (loading) {
  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-hal-navy border-t-transparent dark:border-sky-400 dark:border-t-transparent"></div>
    </div>
  );
}

// Fallbacks
const cards = data?.cards || {
  totalProjects: 0,
  activeProjects: 0,
  delayedProjects: 0,
  openIssues: 0,
  closedIssues: 0,
  decisionsRecorded: 0
};

const cardItems = [
  { label: 'Total Projects', value: cards.totalProjects, icon: FolderGit2, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { label: 'Active Projects', value: cards.activeProjects, icon: FolderCheck, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  { label: 'Delayed Projects', value: cards.delayedProjects, icon: Clock, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  { label: 'Open Issues', value: cards.openIssues, icon: AlertOctagon, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
  { label: 'Closed Issues', value: cards.closedIssues, icon: CheckCircle2, color: 'text-teal-500 bg-teal-500/10 border-teal-500/20' },
  { label: 'Decisions Vault', value: cards.decisionsRecorded, icon: FileCheck, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' }
];

// Extract pending decisions
const pendingDecisions = decisions.filter(d => d.approvalStatus === 'Pending');

// Extract critical/blocker issues
const criticalIssues = issues.filter(i => ['Critical', 'High'].includes(i.priority) && i.status !== 'Resolved' && i.status !== 'Closed');

// Extract upcoming milestones from projects
const upcomingMilestones = [];
projects.forEach(p => {
  p.milestones?.forEach(m => {
    if (!m.completed) {
      upcomingMilestones.push({
        projectName: p.name,
        milestoneName: m.name,
        date: m.date
      });
    }
  });
});
// Sort by date ascending (closest deadline first)
upcomingMilestones.sort((a, b) => new Date(a.date) - new Date(b.date));
const activeDeadlines = upcomingMilestones.slice(0, 3);

return (
  <div className="space-y-6 select-none max-w-7xl mx-auto font-sans">

    {/* Welcome Banner */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-hal-navy to-hal-steel p-6 rounded-3xl text-white shadow-lg border border-slate-700/10">
      <div>
        <h2 className="text-xl font-bold tracking-tight">System Control Room</h2>
        <p className="text-xs text-slate-350 font-light mt-1">Hello, {user?.name}. Credentials validated for {user?.role || 'Operator'}.</p>
      </div>
      <div className="flex gap-2">
        <Link
          to="/ai"
          className="px-4 py-2 bg-sky-500 hover:bg-sky-450 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Launch HAL AI Brain</span>
        </Link>
      </div>
    </div>

    {/* KPI Cards Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
      {cardItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all dark:bg-hal-darkCard dark:border-hal-darkBorder/40 glow-card"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">{item.label}</span>
              <div className={`p-2 rounded-xl ${item.color} border`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{item.value}</span>
            </div>
          </div>
        );
      })}
    </div>

    {/* Main Grid: Left Widgets & Right Calendar/Deadlines */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Left Columns (Widgets) */}
      <div className="lg:col-span-2 space-y-6">

        {/* Actionable Tasks Checklist Widget */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
            <CheckSquare className="h-4.5 w-4.5 text-sky-400" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Today's Assigned Tasks</h3>
          </div>

          <div className="space-y-2">
            {tasks.length > 0 ? (
              tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/50 rounded-xl cursor-pointer transition-all dark:bg-slate-900/60 dark:border-slate-800"
                >
                  {task.done ? (
                    <CheckSquare className="h-4.5 w-4.5 text-sky-400 shrink-0" />
                  ) : (
                    <Square className="h-4.5 w-4.5 text-slate-400 shrink-0" />
                  )}
                  <span className={`text-xs ${task.done ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-350'}`}>
                    {task.text}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No tasks allocated for today.</p>
            )}
          </div>
        </div>

        {/* Pending Approvals & Critical Issues side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Pending Approvals Panel */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Pending Approvals</h3>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full dark:bg-indigo-950/30 dark:text-indigo-400 font-bold">
                {pendingDecisions.length} Wait
              </span>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto">
              {pendingDecisions.length > 0 ? (
                pendingDecisions.map(item => (
                  <div
                    key={item._id || item.id}
                    onClick={() => navigate('/decisions')}
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl cursor-pointer transition-colors dark:bg-slate-900/40 dark:border-slate-800"
                  >
                    <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate">{item.title}</h4>
                    <p className="text-[10px] text-slate-450 mt-1">Project: {item.projectName}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs font-light">
                  No technical logs waiting for approval.
                </div>
              )}
            </div>
          </div>

          {/* Critical Defect Alerts Panel */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-red-400" />
                <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Critical Defects</h3>
              </div>
              <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full dark:bg-red-950/30 dark:text-red-400 font-bold animate-pulse">
                {criticalIssues.length} Alerts
              </span>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto">
              {criticalIssues.length > 0 ? (
                criticalIssues.map(item => (
                  <div
                    key={item._id || item.id}
                    onClick={() => navigate('/issues')}
                    className="p-3 bg-red-950/[0.03] hover:bg-red-950/5 border border-red-500/10 rounded-xl cursor-pointer transition-colors dark:border-red-900/10"
                  >
                    <h4 className="font-bold text-xs text-red-400 truncate">{item.title}</h4>
                    <p className="text-[10px] text-slate-450 mt-1">Division: {item.department} | status: {item.status}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs font-light">
                  No high severity defect tickets open.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Right Side Column (Upcoming Deadlines & Logs) */}
      <div className="space-y-6">

        {/* Upcoming Deadlines (Milestones) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Calendar className="h-4.5 w-4.5 text-sky-400" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Upcoming Deadlines</h3>
          </div>

          <div className="space-y-4">
            {activeDeadlines.length > 0 ? (
              activeDeadlines.map((dl, idx) => (
                <div key={idx} className="flex gap-3 text-xs border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 dark:border-slate-800">
                  <div className="h-9 w-9 rounded-lg bg-sky-50 dark:bg-sky-950/20 flex flex-col items-center justify-center shrink-0 border border-sky-100 dark:border-sky-900/30">
                    <span className="text-[8px] font-bold text-sky-400 uppercase">Milestone</span>
                    <Milestone className="h-3.5 w-3.5 text-sky-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-700 dark:text-slate-250 truncate block">{dl.milestoneName}</span>
                    <p className="text-[10px] text-slate-450 truncate">{dl.projectName}</p>
                    <span className="text-[9px] font-mono text-slate-400 block mt-1">{dl.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4 font-light">No upcoming deadlines found.</p>
            )}
          </div>
        </div>

        {/* Recent decisions feed list */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4.5 w-4.5 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Recent Decisions</h3>
            </div>
          </div>

          <div className="space-y-3.5">
            {decisions.slice(0, 3).map(d => (
              <div key={d._id || d.id} className="text-xs border-b border-slate-100 pb-3 last:border-b-0 last:pb-0 dark:border-slate-800">
                <span className="text-[9px] font-bold text-sky-400 uppercase block">{d.department}</span>
                <Link to="/decisions" className="font-bold text-slate-800 hover:text-sky-500 dark:text-slate-200 transition-colors mt-0.5 block leading-tight">
                  {d.title}
                </Link>
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono mt-1">
                  <span>By {d.createdBy.split(' ')[0]}</span>
                  <span>{d.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed logs (for admin) */}
        {user?.role === 'Administrator' && logs.length > 0 && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
              <Activity className="h-4.5 w-4.5 text-sky-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Activity Feed</h3>
            </div>

            <div className="space-y-3">
              {logs.map(log => (
                <div key={log._id || log.id} className="text-[11px] border-b border-slate-50 pb-2.5 last:border-b-0 last:pb-0 dark:border-slate-850/50">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">{log.action}</span>
                  <p className="text-slate-550 dark:text-slate-400 text-[10.5px] mt-0.5 line-clamp-1 leading-normal">{log.details}</p>
                  <span className="text-[9px] text-slate-400 mt-1 block font-mono">Operator: {log.userName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>

  </div>
);
}
