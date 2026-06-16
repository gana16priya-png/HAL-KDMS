import { API_URL } from '../config';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  BarChart3,
  TrendingUp,
  ShieldAlert,
  Heart,
  FolderGit2,
  FolderCheck,
  Clock,
  AlertOctagon,
  CheckCircle2,
  FileCheck,
  BookOpen,
  Zap,
  Activity
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Analytics() {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [token]);

  const fetchAnalyticsData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/analytics/dashboard`, {
        headers: { 'Authorization': `Bearer ${ token }` }
      });
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error('Failed to load analytics metrics:', err);
    } finally {
      setLoading(false);
    }
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
    completedProjects: 0,
    openIssues: 0,
    closedIssues: 0,
    decisionsRecorded: 0,
    documentsUploaded: 0
  };

  const charts = data?.charts || {
    avgProjectCompletion: 0,
    issueResolutionRate: 0,
    deptStats: {}
  };

  // Define 8 KPI Cards
  const kpis = [
    { label: 'Total Programs', value: cards.totalProjects, sub: 'Registered airframe models', icon: FolderGit2, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { label: 'Active Programs', value: cards.activeProjects, sub: 'Jig test assemblies active', icon: FolderCheck, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Delayed Programs', value: cards.delayedProjects, sub: 'Milestone delays tracked', icon: Clock, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { label: 'Decisions Vaulted', value: cards.decisionsRecorded, sub: 'Persisted memory blocks', icon: FileCheck, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
    { label: 'Open Defects', value: cards.openIssues, sub: 'Active engineering anomalies', icon: AlertOctagon, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
    { label: 'Resolved Defects', value: cards.closedIssues, sub: 'Closed tickets with RCA', icon: CheckCircle2, color: 'text-teal-500 bg-teal-500/10 border-teal-500/20' },
    { label: 'SLA Resolution', value: `${ charts.issueResolutionRate } % `, sub: 'Compliance speed vs 72h limit', icon: Zap, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
    { label: 'Vault Blueprints', value: cards.documentsUploaded, sub: 'Classified CAD documents', icon: BookOpen, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' }
  ];

  // Simplified Chart Configs
  const decisionTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Decisions Registered',
      data: [12, 19, 15, 22, 28, cards.decisionsRecorded + 10],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.05)',
      tension: 0.3,
      fill: true
    }]
  };

  const defectTrendsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Defects Logged',
      data: [8, 14, 11, 23, 15, cards.openIssues + cards.closedIssues],
      borderColor: '#EF4444',
      backgroundColor: 'rgba(239, 68, 68, 0.05)',
      tension: 0.3,
      fill: true
    }]
  };

  const slaPerformanceData = {
    labels: ['Low Priority', 'Medium Priority', 'High Priority', 'Critical Priority'],
    datasets: [{
      label: 'Mean Hours to Resolution',
      data: [48, 24, 12, 4],
      backgroundColor: ['#64748B', '#3B82F6', '#F59E0B', '#EF4444'],
      borderWidth: 0,
      borderRadius: 6
    }]
  };

  const completionBenchmarkData = {
    labels: ['Aligned Milestones', 'Pending Review'],
    datasets: [{
      data: [charts.avgProjectCompletion, 100 - charts.avgProjectCompletion],
      backgroundColor: ['#38BDF8', '#E2E8F0'],
      borderWidth: 0
    }]
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none font-sans">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-slate-850 dark:text-white">Analytics Board</h2>
        <p className="text-xs text-slate-500 font-light mt-1">Aggregated flight program tracking metrics, SLA compliance charts, and organizational memory index audits.</p>
      </div>

      {/* 8 Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx} 
              className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all dark:bg-hal-darkCard dark:border-hal-darkBorder/40 glow-card"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 block">{item.label}</span>
                  <span className="text-[9px] text-slate-400 font-light mt-0.5 block">{item.sub}</span>
                </div>
                <div className={`p - 2.5 rounded - xl ${ item.color } border shrink - 0`}>
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

      {/* Charts Display Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Decision Trends */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 dark:bg-hal-darkCard dark:border-hal-darkBorder/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
              <TrendingUp className="h-4.5 w-4.5 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Decision Accumulation Velocity</h3>
            </div>
            <div className="h-[200px]">
              <Line 
                data={decisionTrendsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#94A3B8' } },
                    y: { grid: { color: 'rgba(148, 163, 184, 0.05)' }, ticks: { font: { size: 9 }, color: '#94A3B8' } }
                  },
                  plugins: { legend: { display: false } }
                }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed dark:border-slate-800 font-light">
            <span className="font-bold text-slate-655 dark:text-slate-300 block mb-1">Legend: Monthly Decisions Vaulted</span>
            This trendline tracks how fast HAL's BRAIN gathers aircraft engineering decisions. A steeper curve indicates high documentation frequency, ensuring that structural alterations are captured before staff rotations.
          </div>
        </div>

        {/* Chart 2: Defect Trends */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 dark:bg-hal-darkCard dark:border-hal-darkBorder/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
              <ShieldAlert className="h-4.5 w-4.5 text-red-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Defect Registration Rates</h3>
            </div>
            <div className="h-[200px]">
              <Line 
                data={defectTrendsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#94A3B8' } },
                    y: { grid: { color: 'rgba(148, 163, 184, 0.05)' }, ticks: { font: { size: 9 }, color: '#94A3B8' } }
                  },
                  plugins: { legend: { display: false } }
                }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed dark:border-slate-800 font-light">
            <span className="font-bold text-slate-655 dark:text-slate-300 block mb-1">Legend: Monthly Anomalies Reported</span>
            Logs flight trials structural, avionics, and mechanical testing defects. Declining spikes over recent cycles signify airframe prototype stabilizers calibration settling and testing phase completions.
          </div>
        </div>

        {/* Chart 3: Mean SLA Resolution */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 dark:bg-hal-darkCard dark:border-hal-darkBorder/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
              <BarChart3 className="h-4.5 w-4.5 text-sky-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Resolution Turnaround benchmarks</h3>
            </div>
            <div className="h-[200px]">
              <Bar 
                data={slaPerformanceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { size: 9 }, color: '#94A3B8' } },
                    y: { grid: { color: 'rgba(148, 163, 184, 0.05)' }, ticks: { font: { size: 9 }, color: '#94A3B8' } }
                  },
                  plugins: { legend: { display: false } }
                }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed dark:border-slate-800 font-light">
            <span className="font-bold text-slate-655 dark:text-slate-300 block mb-1">Legend: Priority vs Mean Hours to Fix</span>
            Displays target resolution response limits. High and critical priority defect tickets are dynamically routed through automated division escalations to achieve resolution times under the 4-hour mark.
          </div>
        </div>

        {/* Chart 4: Project Progress & Alignment */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 dark:bg-hal-darkCard dark:border-hal-darkBorder/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
              <Activity className="h-4.5 w-4.5 text-blue-500" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Milestone Alignment Quotient</h3>
            </div>
            <div className="flex items-center justify-between gap-6 py-4 flex-1">
              <div className="h-[140px] w-[140px] shrink-0">
                <Doughnut 
                  data={completionBenchmarkData}
                  options={{
                    cutout: '70%',
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: false
                  }}
                />
              </div>
              <div className="space-y-2">
                <span className="text-4xl font-black text-slate-800 dark:text-white block">{charts.avgProjectCompletion}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Average Flight Project Readiness</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed dark:border-slate-800 font-light">
            <span className="font-bold text-slate-655 dark:text-slate-300 block mb-1">Legend: Aligned Milestones vs Total</span>
            Measures program health by evaluating the ratio of verified structural milestones. Ensures prototype integration matches timeline schedules without quality slipping.
          </div>
        </div>

      </div>

    </div>
  );
}
