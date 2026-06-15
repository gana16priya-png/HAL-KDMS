import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  User, 
  Activity, 
  FileEdit, 
  CheckCircle, 
  AlertCircle,
  Building,
  ShieldCheck,
  Download
} from 'lucide-react';
import { divisionsList } from '../utils/divisions';

export default function IssueTracker() {
  const { token, user } = useContext(AuthContext);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Creation Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState(divisionsList[0]);
  const [priority, setPriority] = useState('Medium');
  const [severity, setSeverity] = useState('Major');
  const [error, setError] = useState('');

  // Selected Issue Details
  const [selectedIssue, setSelectedIssue] = useState(null);
  
  // Edit/Resolution forms
  const [status, setStatus] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [resolution, setResolution] = useState('');
  const [editError, setEditError] = useState('');

  const departments = divisionsList;
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const severities = ['Minor', 'Major', 'Critical', 'Blocker'];
  const workflowSteps = ['Reported', 'Assigned', 'In Progress', 'Under Review', 'Resolved', 'Closed'];

  useEffect(() => {
    fetchIssues();
  }, [token]);

  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/issues', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const list = await res.json();
        setIssues(list);
      }
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !description) return setError('Please enter title and description.');

    setError('');
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, department, priority, severity })
      });

      if (res.ok) {
        setTitle('');
        setDescription('');
        setShowForm(false);
        fetchIssues();
      } else {
        const d = await res.json();
        setError(d.message || 'Failed to file issue.');
      }
    } catch (err) {
      setError('Server connection failed.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedIssue) return;

    setEditError('');
    try {
      const res = await fetch(`/api/issues/${selectedIssue._id || selectedIssue.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, rootCause, resolution })
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedIssue(updated);
        fetchIssues();
      } else {
        const d = await res.json();
        setEditError(d.message || 'Failed to update issue.');
      }
    } catch (err) {
      setEditError('Server connection failed.');
    }
  };

  // Helper to open details and prefill updates
  const handleSelectIssue = (issue) => {
    setSelectedIssue(issue);
    setStatus(issue.status);
    setRootCause(issue.rootCause || '');
    setResolution(issue.resolution || '');
    setEditError('');
  };

  const handleDownloadPDF = (id) => {
    window.open(`/api/issues/${id}/pdf?auth_token=${token}`, '_blank');
    
    // Fallback: fetch API with authorization header
    fetch(`/api/issues/${id}/pdf`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('PDF download failed.');
      return res.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Issue_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch(err => console.error('Error fetching issue report:', err));
  };

  // Filter issues
  const filteredIssues = issues.filter(i => {
    return i.title.toLowerCase().includes(search.toLowerCase()) || 
           i.department.toLowerCase().includes(search.toLowerCase()) ||
           i.priority.toLowerCase().includes(search.toLowerCase());
  });

  // Calculate active SLA hours & escalation level
  const getSlaInfo = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffMs = now - created;
    const diffHours = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
    
    let activeLevel = 0; // 0: Normal, 1: Dept Head (24h), 2: PM (48h), 3: Senior Management (72h)
    if (diffHours >= 72) activeLevel = 3;
    else if (diffHours >= 48) activeLevel = 2;
    else if (diffHours >= 24) activeLevel = 1;

    return { diffHours, activeLevel };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-850 dark:text-white">Smart Issue Tracker</h2>
          <p className="text-xs text-slate-500 font-light mt-1">Automatic engineering assignments with SLA monitoring and multi-tiered escalations.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-sky-500/10 flex items-center gap-1.5 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Report Engineering Defect</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left column: Search and list */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Search bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search defects by title, priority, department..."
                className="w-full pl-10 pr-3 py-1.8 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-450 focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* List display */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex h-40 w-full items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-hal-navy border-t-transparent dark:border-sky-400 dark:border-t-transparent"></div>
              </div>
            ) : filteredIssues.length > 0 ? (
              filteredIssues.map(item => {
                const isClosed = ['Resolved', 'Closed'].includes(item.status);
                const { diffHours, activeLevel } = getSlaInfo(item.createdAt);
                
                return (
                  <div
                    key={item._id || item.id}
                    onClick={() => handleSelectIssue(item)}
                    className={`bg-white border p-5 rounded-2xl cursor-pointer hover:shadow-md transition-all dark:bg-hal-darkCard dark:border-hal-darkBorder/40 ${selectedIssue?._id === item._id ? 'border-sky-400 dark:border-sky-850 bg-sky-50/10' : 'border-slate-200/80'}`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                            item.priority === 'Critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                            item.priority === 'High' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                            'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                          }`}>
                            {item.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{item.department}</span>
                          
                          {/* SLA Active Indicator */}
                          {!isClosed && activeLevel > 0 && (
                            <span className="text-[9px] px-2 py-0.5 rounded font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                              SLA Escalated (L{activeLevel})
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-slate-800 dark:text-white mt-1.5">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 max-w-lg">{item.description}</p>
                      </div>

                      <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800 flex justify-between sm:flex-col sm:items-end gap-1">
                        <span className="text-xs font-semibold text-sky-400">{item.status}</span>
                        <span className="text-[10px] text-slate-450 block font-light">Lead: {item.assignedTo || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
                <p className="text-xs text-slate-400">No reported defects match your search.</p>
              </div>
            )}
          </div>

        </div>

        {/* Right column: Form OR Details */}
        <div className="space-y-6">
          
          {/* Create defect Form */}
          {showForm && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 dark:bg-hal-darkCard dark:border-hal-darkBorder/40 shadow-xl">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">Raise Defect Report</h3>
                <button 
                  onClick={() => setShowForm(false)} 
                  className="text-xs font-medium text-slate-400 hover:text-slate-650"
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
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Defect Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Flight controls hydraulic line leak"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Description</label>
                  <textarea
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed description of test context or telemetry parameters..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                  ></textarea>
                </div>

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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                    >
                      {priorities.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Severity</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                    >
                      {severities.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                >
                  File Ticket (Trigger SLA Routing)
                </button>
              </form>
            </div>
          )}

          {/* Issue Details Card */}
          {selectedIssue ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 dark:bg-hal-darkCard dark:border-hal-darkBorder/40 space-y-5">
              
              {/* Card Header */}
              <div className="border-b border-slate-100 pb-4 dark:border-slate-800 flex justify-between items-start gap-4">
                <div className="space-y-1.5 flex-1">
                  <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">{selectedIssue.department} node</span>
                  <h3 className="font-extrabold text-base text-slate-850 dark:text-white leading-snug">{selectedIssue.title}</h3>
                  
                  <div className="flex gap-2">
                    <span className="text-[9px] px-2 py-0.5 bg-slate-100 dark:bg-slate-850 rounded font-semibold text-slate-500">Status: {selectedIssue.status}</span>
                    <span className="text-[9px] px-2 py-0.5 bg-slate-100 dark:bg-slate-850 rounded font-semibold text-slate-500">Severity: {selectedIssue.severity}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadPDF(selectedIssue._id || selectedIssue.id)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-650 rounded-xl border border-slate-200/60 transition-colors dark:bg-slate-900/60 dark:border-slate-800 dark:text-sky-400 dark:hover:bg-slate-800 shrink-0"
                  title="Export Official PDF"
                >
                  <Download className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* SLA Timeline display */}
              {selectedIssue.status !== 'Closed' && selectedIssue.status !== 'Resolved' && (
                <div className="space-y-3 bg-slate-50 border border-slate-200/60 p-4 rounded-xl dark:bg-slate-900/40 dark:border-slate-800">
                  
                  {/* Calculations */}
                  {(() => {
                    const { diffHours, activeLevel } = getSlaInfo(selectedIssue.createdAt);
                    return (
                      <>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                          <span>SLA Active Monitor</span>
                          <span className={`${activeLevel > 0 ? 'text-red-400 animate-pulse' : 'text-emerald-500'}`}>
                            {diffHours} Hours Active
                          </span>
                        </div>

                        {/* Visual Timeline Nodes */}
                        <div className="relative flex justify-between items-center mt-3 pt-2">
                          {/* Connecting lines */}
                          <div className="absolute top-[18px] left-[10px] right-[10px] h-[3px] bg-slate-200 dark:bg-slate-800 -z-0"></div>
                          <div 
                            className="absolute top-[18px] left-[10px] h-[3px] bg-amber-500 transition-all duration-300 -z-0"
                            style={{ width: `${activeLevel === 1 ? '33%' : activeLevel === 2 ? '66%' : activeLevel === 3 ? '100%' : '0%'}` }}
                          ></div>

                          {/* Node 1: Normal (0h) */}
                          <div className="flex flex-col items-center gap-1 z-10">
                            <div className="h-6 w-6 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-[8px] border-2 border-white dark:border-hal-darkCard">0h</div>
                            <span className="text-[8px] font-semibold text-slate-450 tracking-tight">Report</span>
                          </div>

                          {/* Node 2: Dept Head (24h) */}
                          <div className="flex flex-col items-center gap-1 z-10">
                            <div className={`h-6 w-6 rounded-full font-bold flex items-center justify-center text-[8px] border-2 border-white dark:border-hal-darkCard ${
                              activeLevel >= 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                            }`}>L1</div>
                            <span className="text-[8px] font-semibold text-slate-450 tracking-tight">Dept Head</span>
                          </div>

                          {/* Node 3: PM (48h) */}
                          <div className="flex flex-col items-center gap-1 z-10">
                            <div className={`h-6 w-6 rounded-full font-bold flex items-center justify-center text-[8px] border-2 border-white dark:border-hal-darkCard ${
                              activeLevel >= 2 ? 'bg-orange-500 text-slate-950 animate-pulse' : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                            }`}>L2</div>
                            <span className="text-[8px] font-semibold text-slate-450 tracking-tight">Project Mgr</span>
                          </div>

                          {/* Node 4: Senior Mgmt (72h) */}
                          <div className="flex flex-col items-center gap-1 z-10">
                            <div className={`h-6 w-6 rounded-full font-bold flex items-center justify-center text-[8px] border-2 border-white dark:border-hal-darkCard ${
                              activeLevel >= 3 ? 'bg-red-500 text-slate-950 animate-bounce' : 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                            }`}>L3</div>
                            <span className="text-[8px] font-semibold text-slate-450 tracking-tight">Senior VP</span>
                          </div>

                        </div>
                      </>
                    );
                  })()}

                </div>
              )}

              {/* Text Fields */}
              <div className="space-y-4 text-xs text-slate-650 dark:text-slate-350">
                <div>
                  <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] block mb-1">Issue Description</span>
                  <p className="font-light leading-relaxed">{selectedIssue.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] block mb-1">Assigned Lead</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-250 flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-sky-400" />
                      <span>{selectedIssue.assignedTo || 'Pending Assignment'}</span>
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] block mb-1">Reported By</span>
                    <p className="font-semibold text-slate-800 dark:text-slate-250 flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>{selectedIssue.reportedBy}</span>
                    </p>
                  </div>
                </div>

                {/* Root cause and resolutions */}
                {selectedIssue.rootCause && (
                  <div className="p-3 bg-red-950/10 border border-red-900/10 rounded-xl">
                    <span className="font-bold text-red-400 uppercase text-[9px] block mb-1">Investigated Root Cause</span>
                    <p className="font-light text-slate-700 dark:text-slate-300">{selectedIssue.rootCause}</p>
                  </div>
                )}

                {selectedIssue.resolution && (
                  <div className="p-3 bg-emerald-950/10 border border-emerald-900/10 rounded-xl">
                    <span className="font-bold text-emerald-400 uppercase text-[9px] block mb-1">Applied Resolution</span>
                    <p className="font-light text-slate-700 dark:text-slate-300">{selectedIssue.resolution}</p>
                  </div>
                )}

              </div>

              {/* Work action form (Assignee or Admin/PM) */}
              {(!['Closed', 'Resolved'].includes(selectedIssue.status)) && (
                <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="flex items-center gap-1 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <FileEdit className="h-4.5 w-4.5 text-sky-400" />
                    <span>Update Ticket Progress</span>
                  </div>

                  {editError && (
                    <div className="mb-2 text-red-400 text-[10px]">{editError}</div>
                  )}

                  <form onSubmit={handleUpdate} className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Progress State</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                        >
                          {workflowSteps.map(step => (
                            <option key={step} value={step}>{step}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Root Cause Investigation</label>
                      <textarea
                        rows="1"
                        value={rootCause}
                        onChange={(e) => setRootCause(e.target.value)}
                        placeholder="Log diagnostic findings..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1">Corrective Resolution Actions</label>
                      <textarea
                        rows="1"
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder="Log engineering fix applied..."
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-sky-500 hover:bg-sky-450 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
                    >
                      Update Ticket
                    </button>
                  </form>
                </div>
              )}

            </div>
          ) : (
            !showForm && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
                <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-xs text-slate-400 leading-normal font-light">Select a defect ticket from the registry to monitor SLA timelines, inspect assignees, or file resolution progress.</p>
              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
}
