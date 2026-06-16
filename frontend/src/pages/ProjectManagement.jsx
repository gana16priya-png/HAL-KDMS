import { API_URL } from '../config';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import {
  Plus,
  PlusCircle,
  FolderOpen,
  Calendar,
  User,
  CheckSquare,
  Square,
  AlertTriangle,
  Settings,
  XCircle,
  FileCheck,
  Milestone
} from 'lucide-react';
import { divisionsList } from '../utils/divisions';

export default function ProjectManagement() {
  const { token, user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Creation Form State
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState(divisionsList[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectManager, setProjectManager] = useState('');
  const [status, setStatus] = useState('Active');
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [milestonesInput, setMilestonesInput] = useState('');
  const [error, setError] = useState('');

  // Selected Project Details
  const [selectedProject, setSelectedProject] = useState(null);

  const departments = divisionsList;
  const statuses = ['Not Started', 'Active', 'Completed', 'Delayed'];

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_URL}/projects', {
        headers: { 'Authorization': `Bearer ${ token }` }
      });
      if (res.ok) {
        const list = await res.json();
        setProjects(list);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return setError('Please enter name and timelines.');

    setError('');
    
    // Parse Milestones CSV: Name:Date, Name:Date
    const milestones = milestonesInput ? milestonesInput.split(',').map(item => {
      const parts = item.split(':');
      return {
        name: parts[0]?.trim() || 'Milestone',
        date: parts[1]?.trim() || new Date().toISOString().split('T')[0],
        completed: false
      };
    }) : [];

    try {
      const res = await fetch(`${ API_URL } / projects', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
        body: JSON.stringify({
          name,
          department,
          startDate,
          endDate,
          projectManager: projectManager || user.name,
          status,
          progressPercentage,
          milestones,
          risks: []
        })
      });

    if (res.ok) {
      setName('');
      setStartDate('');
      setEndDate('');
      setProjectManager('');
      setMilestonesInput('');
      setShowForm(false);
      fetchProjects();
    } else {
      const d = await res.json();
      setError(d.message || 'Failed to create project.');
    }
  } catch (err) {
    setError('Server connection failed.');
  }
};

// Toggle single milestone completeness
const handleToggleMilestone = async (project, milestoneIdx) => {
  if (!['Administrator', 'Project Manager'].includes(user?.role)) return;

  const updatedMilestones = [...project.milestones];
  updatedMilestones[milestoneIdx].completed = !updatedMilestones[milestoneIdx].completed;

  // Recalculate progress based on percentage of completed milestones
  const completedCount = updatedMilestones.filter(m => m.completed).length;
  const progressPercentage = Math.round((completedCount / updatedMilestones.length) * 100);

  try {
    const res = await fetch(`/api/projects/${project._id || project.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        milestones: updatedMilestones,
        progressPercentage
      })
    });

    if (res.ok) {
      const updated = await res.json();
      setSelectedProject(updated);
      fetchProjects();
    }
  } catch (err) {
    console.error('Failed to update milestone state:', err);
  }
};

// Update overall progress percentage manually
const handleProgressChange = async (project, value) => {
  try {
    const res = await fetch(`/api/projects/${project._id || project.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ progressPercentage: Number(value) })
    });

    if (res.ok) {
      const updated = await res.json();
      setSelectedProject(updated);
      fetchProjects();
    }
  } catch (err) {
    console.error('Failed to update project progress:', err);
  }
};

return (
  <div className="space-y-6 max-w-7xl mx-auto">

    {/* Page Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-850 dark:text-white">Project Control Center</h2>
        <p className="text-xs text-slate-500 font-light mt-1">Track active aerospace programs, milestone grids, and technical risks.</p>
      </div>
      {['Administrator', 'Project Manager'].includes(user?.role) && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-sky-500/10 flex items-center gap-1.5 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Initiate Project</span>
        </button>
      )}
    </div>

    {/* Grid splits */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

      {/* Left Side: Projects Grid List */}
      <div className="lg:col-span-2 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="flex h-40 w-full items-center justify-center col-span-2">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-hal-navy border-t-transparent dark:border-sky-400 dark:border-t-transparent"></div>
            </div>
          ) : projects.length > 0 ? (
            projects.map(proj => (
              <div
                key={proj._id || proj.id}
                onClick={() => setSelectedProject(proj)}
                className={`bg-white border rounded-2xl p-5 cursor-pointer hover:shadow-md transition-all dark:bg-hal-darkCard dark:border-hal-darkBorder/40 ${selectedProject?._id === proj._id ? 'border-sky-400 dark:border-sky-850 bg-sky-50/10' : 'border-slate-200/80'
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-slate-400 font-semibold">{proj.department}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${proj.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' :
                    proj.status === 'Delayed' ? 'bg-red-500/10 text-red-500' : 'bg-sky-500/10 text-sky-500'
                    }`}>
                    {proj.status}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate">{proj.name}</h4>

                {/* Progress Bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-400">Completion Align</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-250">{proj.progressPercentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                    <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${proj.progressPercentage}%` }}></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-[10px] text-slate-450 dark:border-slate-800/80">
                  <span className="truncate max-w-[120px]">Lead: {proj.projectManager}</span>
                  <span className="font-mono text-[9px]">{proj.startDate}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center col-span-2 dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
              <p className="text-xs text-slate-400">No active projects registered.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Form OR Detail and Milestone tracker */}
      <div className="space-y-6">

        {/* Form */}
        {showForm && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 dark:bg-hal-darkCard dark:border-hal-darkBorder/40 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">Configure New Project</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-xs font-medium text-slate-400 hover:text-slate-655"
              >
                Cancel
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-900 rounded-lg text-xs text-red-400 flex items-start gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Project Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. LCA Tejas MK2 Build"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Department Node</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                  >
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Project Manager</label>
                  <input
                    type="text"
                    value={projectManager}
                    onChange={(e) => setProjectManager(e.target.value)}
                    placeholder="Name"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Initial Milestones (CSV Name:YYYY-MM-DD)</label>
                <textarea
                  rows="2"
                  value={milestonesInput}
                  onChange={(e) => setMilestonesInput(e.target.value)}
                  placeholder="Wind Tunnel:2026-08-01, Wing Integration:2026-12-15"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Create Program
              </button>
            </form>
          </div>
        )}

        {/* Project Details Panel */}
        {selectedProject ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 dark:bg-hal-darkCard dark:border-hal-darkBorder/40 space-y-5">

            {/* Header */}
            <div className="border-b border-slate-100 pb-4 dark:border-slate-800 space-y-2">
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">{selectedProject.department} node</span>
              <h3 className="font-extrabold text-base text-slate-850 dark:text-white leading-snug">{selectedProject.name}</h3>

              <div className="flex gap-2">
                <span className="text-[10px] px-2 py-0.5 bg-slate-55 rounded font-mono text-slate-500">Lead: {selectedProject.projectManager}</span>
              </div>
            </div>

            {/* Progress slider (PM/Admin edit) */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <span>Milestone progress</span>
                <span>{selectedProject.progressPercentage}%</span>
              </div>
              {['Administrator', 'Project Manager'].includes(user?.role) ? (
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedProject.progressPercentage}
                  onChange={(e) => handleProgressChange(selectedProject, e.target.value)}
                  className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              ) : (
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden dark:bg-slate-800">
                  <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${selectedProject.progressPercentage}%` }}></div>
                </div>
              )}
            </div>

            {/* Timeline Milestones checklists */}
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 dark:border-slate-800">
                <Milestone className="h-4 w-4 text-sky-400" />
                <span>Program Milestones Timeline</span>
              </div>

              <div className="space-y-3.5 relative pl-4 border-l border-slate-200 dark:border-slate-800">
                {selectedProject.milestones?.map((m, idx) => {
                  const isClickable = ['Administrator', 'Project Manager'].includes(user?.role);
                  return (
                    <div key={idx} className="relative text-xs">

                      {/* Node bullet */}
                      <span className={`absolute -left-[20.5px] top-0.5 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${m.completed ? 'bg-sky-400 border-sky-400 text-slate-950' : 'bg-slate-50 border-slate-300 dark:bg-hal-darkCard dark:border-slate-700'
                        }`}></span>

                      <div
                        onClick={() => handleToggleMilestone(selectedProject, idx)}
                        className={`flex items-start justify-between gap-3 ${isClickable ? 'cursor-pointer hover:text-sky-400' : ''}`}
                      >
                        <div>
                          <span className={`font-semibold block ${m.completed ? 'text-slate-800 dark:text-slate-200 line-through font-light' : 'text-slate-750 dark:text-slate-300'}`}>{m.name}</span>
                          <span className="text-[9px] text-slate-450 block font-mono mt-0.5">{m.date}</span>
                        </div>
                        {m.completed ? (
                          <CheckSquare className="h-4 w-4 text-sky-400 shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-400 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Risks list */}
            {selectedProject.risks?.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Identified Risk Registers</span>
                <div className="space-y-2">
                  {selectedProject.risks.map((risk, idx) => (
                    <div key={idx} className="p-3 bg-red-950/5 border border-red-900/10 rounded-xl flex gap-2.5 text-xs">
                      <AlertTriangle className="h-4.5 w-4.5 text-red-400 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">{risk.title} ({risk.severity} Severity)</span>
                        <p className="text-[11px] text-slate-500 font-light mt-1">{risk.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* timelines dates */}
            <div className="border-t border-slate-100 pt-4 text-[10px] font-mono text-slate-450 flex justify-between dark:border-slate-800">
              <span>Start: {selectedProject.startDate}</span>
              <span>End: {selectedProject.endDate}</span>
            </div>

          </div>
        ) : (
          !showForm && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
              <FolderOpen className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-xs text-slate-400 leading-normal font-light">Select a project node from the grid to check milestones checklists, timelines, and active risk registers.</p>
            </div>
          )
        )}

      </div>

    </div>

  </div>
);
}
