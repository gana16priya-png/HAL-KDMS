import { API_URL } from '../config';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import {
  Search,
  Plus,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { divisionsList } from '../utils/divisions';

export default function DecisionManagement() {
  const { token, user } = useContext(AuthContext);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Creation Form state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [projectName, setProjectName] = useState('');
  const [department, setDepartment] = useState(divisionsList[0]);
  const [description, setDescription] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [benefits, setBenefits] = useState('');
  const [risks, setRisks] = useState('');
  const [docsInput, setDocsInput] = useState('');
  const [error, setError] = useState('');

  const [selectedDecision, setSelectedDecision] = useState(null);

  const departments = divisionsList;

  useEffect(() => {
    fetchDecisions();
  }, [token]);

  const fetchDecisions = async () => {
    try {
      const res = await fetch(`${API_URL}/decisions', {
        headers: { 'Authorization': `Bearer ${ token }` }
      });
      if (res.ok) {
        const list = await res.json();
        setDecisions(list);
      }
    } catch (err) {
      console.error('Failed to load decisions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !projectName || !description || !reasoning || !benefits || !risks) {
      return setError('Please fill in all mandatory text blocks.');
    }

    setError('');
    const docs = docsInput ? docsInput.split(',').map(d => d.trim()) : [];

    try {
      const res = await fetch(`${ API_URL } / decisions', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
        body: JSON.stringify({
          title,
          projectName,
          department,
          description,
          reasoning,
          benefits,
          risks,
          supportingDocuments: docs
        })
      });

    if (res.ok) {
      // Clear forms
      setTitle('');
      setProjectName('');
      setDescription('');
      setReasoning('');
      setBenefits('');
      setRisks('');
      setDocsInput('');
      setShowForm(false);
      fetchDecisions();
    } else {
      const d = await res.json();
      setError(d.message || 'Failed to record decision.');
    }
  } catch (err) {
    setError('Server connection failed.');
  }
};

const handleUpdateStatus = async (id, approvalStatus) => {
  try {
    const res = await fetch(`/api/decisions/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ approvalStatus })
    });

    if (res.ok) {
      fetchDecisions();
      // Update selected decision view if it is open
      if (selectedDecision && selectedDecision._id === id) {
        setSelectedDecision(prev => ({ ...prev, approvalStatus }));
      }
    }
  } catch (err) {
    console.error('Failed to approve/reject decision:', err);
  }
};

const handleDownloadPDF = (id) => {
  // Triggers standard window routing download
  window.open(`/api/decisions/${id}/pdf?auth_token=${token}`, '_blank');

  // Fallback: fetch API with authorization header and download PDF
  fetch(`/api/decisions/${id}/pdf`, {
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
      a.download = `Decision_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch(err => console.error('Error fetching decision report:', err));
};

// Filters logic
const filteredDecisions = decisions.filter(d => {
  const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.projectName.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase());

  const matchesDept = filterDept === 'All' || d.department === filterDept;
  const matchesStatus = filterStatus === 'All' || d.approvalStatus === filterStatus;

  return matchesSearch && matchesDept && matchesStatus;
});

return (
  <div className="space-y-6 max-w-7xl mx-auto">

    {/* Header bar */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Decision Archive</h2>
        <p className="text-xs text-slate-500 font-light mt-1">Preserve, verify, and output organization-level engineering decisions.</p>
      </div>
      {user?.role !== 'Employee' && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-sky-500/10 flex items-center gap-1.5 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Record Technical Decision</span>
        </button>
      )}
    </div>

    {/* Main Grid: Form / List / Detail panels */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

      {/* Left Side: Filter and List */}
      <div className="lg:col-span-2 space-y-4">

        {/* Search/Filter toolbar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 dark:bg-hal-darkCard dark:border-hal-darkBorder/40 flex flex-wrap gap-3 items-center">

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, project..."
              className="w-full pl-10 pr-3 py-1.8 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
            />
          </div>

          {/* Department Filter */}
          <div className="relative">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="pl-3 pr-8 py-1.8 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-350 appearance-none"
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-3 pr-8 py-1.8 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-350 appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

        </div>

        {/* List display */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex h-40 w-full items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-hal-navy border-t-transparent dark:border-sky-400 dark:border-t-transparent"></div>
            </div>
          ) : filteredDecisions.length > 0 ? (
            filteredDecisions.map(item => (
              <div
                key={item._id || item.id}
                onClick={() => setSelectedDecision(item)}
                className={`bg-white border p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 cursor-pointer hover:shadow-md transition-all dark:bg-hal-darkCard dark:border-hal-darkBorder/40 ${selectedDecision?._id === item._id ? 'border-sky-400 dark:border-sky-850 bg-sky-50/10' : 'border-slate-200/80'}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${item.approvalStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                      item.approvalStatus === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                      {item.approvalStatus}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{item.department}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white mt-1.5">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate max-w-md">{item.description}</p>
                </div>
                <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block">Logged by {item.createdBy.split(' ')[0]}</span>
                    <span className="text-[9px] font-mono text-slate-450 block">{item.date}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 hidden sm:block" />
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
              <p className="text-xs text-slate-400">No decisions matched your search parameters.</p>
            </div>
          )}
        </div>

      </div>

      {/* Right Side Panels: Creation Form OR Detail Card */}
      <div className="space-y-6">

        {/* Create Decision Form */}
        {showForm && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 dark:bg-hal-darkCard dark:border-hal-darkBorder/40 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Log Decision Record</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-white"
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
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5">Decision Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Avionics safety component swap"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. LCA Tejas Mk2 Design"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
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
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5">Attach References</label>
                  <input
                    type="text"
                    value={docsInput}
                    onChange={(e) => setDocsInput(e.target.value)}
                    placeholder="Doc1.pdf, Doc2.pdf"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5">Core Description</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the action or change logged..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5">Reasoning / Justification</label>
                <textarea
                  rows="2"
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  placeholder="Why was this action chosen over alternatives?"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5">Identified Benefits</label>
                <textarea
                  rows="2"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                  placeholder="Expected safety, schedule, or cost gains..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1.5">Identified Risks & Mitigation</label>
                <textarea
                  rows="2"
                  value={risks}
                  onChange={(e) => setRisks(e.target.value)}
                  placeholder="What risks does this add, and how will they be tracked?"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Save to Archive
              </button>
            </form>
          </div>
        )}

        {/* Decision Detail Card */}
        {selectedDecision ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 dark:bg-hal-darkCard dark:border-hal-darkBorder/40 space-y-4">

            {/* Card Header */}
            <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">{selectedDecision.department} Archive</span>
                <h3 className="font-extrabold text-base text-slate-850 dark:text-white mt-1">{selectedDecision.title}</h3>
              </div>
              <button
                onClick={() => handleDownloadPDF(selectedDecision._id || selectedDecision.id)}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200/60 transition-colors dark:bg-slate-900/60 dark:border-slate-800 dark:text-sky-400 dark:hover:bg-slate-800"
                title="Export Official PDF"
              >
                <Download className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Data parameters list */}
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">

              <div>
                <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider block mb-1">Target Project</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedDecision.projectName}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider block mb-1">Core Description</span>
                <p className="font-light leading-relaxed">{selectedDecision.description}</p>
              </div>

              <div>
                <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider block mb-1">Reasoning / Justification</span>
                <p className="font-light leading-relaxed">{selectedDecision.reasoning}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider block mb-1">Expected Benefits</span>
                  <p className="font-light leading-relaxed text-emerald-500">{selectedDecision.benefits}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider block mb-1">Identified Risks</span>
                  <p className="font-light leading-relaxed text-red-400">{selectedDecision.risks}</p>
                </div>
              </div>

              {selectedDecision.supportingDocuments?.length > 0 && (
                <div>
                  <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider block mb-1">Supporting Certificates</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedDecision.supportingDocuments.map((docName, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-650 rounded border border-slate-200/50 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-350">
                        <BookOpen className="h-3 w-3 text-sky-400" />
                        <span>{docName}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Audit metadata */}
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] text-slate-400 font-mono dark:border-slate-800">
                <span>Author: {selectedDecision.createdBy}</span>
                <span>Date: {selectedDecision.date}</span>
              </div>

            </div>

            {/* Approval controls (PM/Admin only) */}
            {selectedDecision.approvalStatus === 'Pending' && ['Administrator', 'Project Manager'].includes(user?.role) && (
              <div className="border-t border-slate-100 pt-4 flex gap-3 dark:border-slate-800">
                <button
                  onClick={() => handleUpdateStatus(selectedDecision._id || selectedDecision.id, 'Approved')}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Approve Log</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedDecision._id || selectedDecision.id, 'Rejected')}
                  className="flex-1 py-2 bg-red-500 hover:bg-red-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject Log</span>
                </button>
              </div>
            )}

          </div>
        ) : (
          !showForm && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
              <FileText className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-xs text-slate-400 leading-normal">Select a decision from the archive list to decrypt and review safety parameters.</p>
            </div>
          )
        )}

      </div>

    </div>

  </div>
);
}
