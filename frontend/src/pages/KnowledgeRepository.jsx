import { API_URL } from '../config';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import {
  Search,
  Filter,
  FileText,
  AlertTriangle,
  FolderGit2,
  FolderLock,
  ChevronRight,
  Plane
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { divisionsList } from '../utils/divisions';

export default function KnowledgeRepository() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // All, Decision, Issue, Project, Document
  const [selectedDept, setSelectedDept] = useState('All');

  const departments = divisionsList;
  const tabs = ['All', 'Decision', 'Issue', 'Project', 'Document'];

  useEffect(() => {
    fetchEverything();
  }, [token]);

  const fetchEverything = async () => {
    try {
      setLoading(true);
      // Fetch concurrently
      const [decRes, projRes, issRes, docRes] = await Promise.all([
        fetch(`${API_URL}/api/decisions`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/projects`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/issues`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/api/documents`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      let decisions = decRes.ok ? await decRes.json() : [];
      let projects = projRes.ok ? await projRes.json() : [];
      let issues = issRes.ok ? await issRes.json() : [];
      let documents = docRes.ok ? await docRes.json() : [];

      // Consolidate into a single layout list
      const combined = [
        ...decisions.map(d => ({
          id: d._id || d.id,
          type: 'Decision',
          title: d.title,
          desc: d.description,
          dept: d.department,
          meta: `Logged by ${d.createdBy}`,
          date: d.date,
          path: '/decisions'
        })),
        ...projects.map(p => ({
          id: p._id || p.id,
          type: 'Project',
          title: p.name,
          desc: `Active aerospace project under ${p.projectManager}. Start date: ${p.startDate}. Progress: ${p.progressPercentage}%`,
          dept: p.department,
          meta: `Manager: ${p.projectManager}`,
          date: p.startDate,
          path: '/projects'
        })),
        ...issues.map(i => ({
          id: i._id || i.id,
          type: 'Issue',
          title: i.title,
          desc: i.description,
          dept: i.department,
          meta: `Assigned: ${i.assignedTo || 'Unassigned'} | Priority: ${i.priority}`,
          date: i.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          path: '/issues'
        })),
        ...documents.map(doc => ({
          id: doc._id || doc.id,
          type: 'Document',
          title: doc.name,
          desc: `Manual/Blueprint index with tags: ${doc.tags.join(', ')}. Format: ${doc.extension}`,
          dept: 'Aerospace Core', // Documents don't have explicit dept, fallback
          meta: `Uploader: ${doc.uploader} | v${doc.version}`,
          date: doc.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          path: '/documents'
        }))
      ];

      // Sort by date descending
      combined.sort((a, b) => new Date(b.date) - new Date(a.date));

      setItems(combined);
    } catch (err) {
      console.error('Failed to load repository index:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter combined lists
  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.desc.toLowerCase().includes(search.toLowerCase());

    const matchesTab = activeTab === 'All' || item.type === activeTab;
    const matchesDept = selectedDept === 'All' || item.dept === selectedDept || item.dept === 'Aerospace Core';

    return matchesSearch && matchesTab && matchesDept;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">

      {/* Header */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h2 className="text-xl font-bold tracking-tight text-slate-850 dark:text-white">Knowledge Hub</h2>
        <p className="text-xs text-slate-500 font-light mt-1">Cross-referencing database searching decisions, issues, active projects, and blueprints.</p>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 dark:bg-hal-darkCard dark:border-hal-darkBorder/40 flex flex-wrap gap-4 items-center">

        {/* Search */}
        <div className="relative flex-1 min-w-[280px]">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Global search across all classifications (e.g. landing gear, titanium)..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-450 focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
          />
        </div>

        {/* Dept Selection */}
        <div className="relative flex items-center gap-1.5 text-xs text-slate-500">
          <Filter className="h-4 w-4 text-sky-400" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="pl-2 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-650 focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-350 appearance-none"
          >
            <option value="All">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-150 dark:border-slate-800 gap-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 font-bold text-xs transition-all relative ${activeTab === tab
              ? 'text-sky-400 font-extrabold border-b-2 border-sky-400'
              : 'text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            {tab === 'All' ? 'All Archive' : `${tab}s`}
          </button>
        ))}
      </div>

      {/* Results grid */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex h-40 w-full items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-hal-navy border-t-transparent dark:border-sky-400 dark:border-t-transparent"></div>
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div
              key={`${item.type}-${item.id}`}
              onClick={() => navigate(item.path)}
              className="bg-white border border-slate-200/80 p-5 rounded-2xl flex items-center justify-between gap-6 cursor-pointer hover:shadow-md transition-all dark:bg-hal-darkCard dark:border-hal-darkBorder/40 glow-card"
            >
              <div className="flex gap-4">

                {/* Icon wrapper based on classification */}
                <div className={`p-3 rounded-xl border shrink-0 h-11 w-11 flex items-center justify-center ${item.type === 'Decision' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                  item.type === 'Issue' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    item.type === 'Project' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                      'bg-sky-500/10 border-sky-500/20 text-sky-500'
                  }`}>
                  {item.type === 'Decision' ? <FileText className="h-4.5 w-4.5" /> :
                    item.type === 'Issue' ? <AlertTriangle className="h-4.5 w-4.5" /> :
                      item.type === 'Project' ? <FolderGit2 className="h-4.5 w-4.5" /> :
                        <FolderLock className="h-4.5 w-4.5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{item.type}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                    <span className="text-[9px] font-bold text-sky-400 tracking-tight uppercase">{item.dept}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white mt-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 font-light leading-relaxed">{item.desc}</p>
                </div>

              </div>

              <div className="flex items-center gap-3 shrink-0 text-right">
                <div>
                  <span className="text-[9px] text-slate-400 block">{item.meta}</span>
                  <span className="text-[9.5px] font-mono text-slate-450 block mt-1">{item.date}</span>
                </div>
                <ChevronRight className="h-4.5 w-4.5 text-slate-350" />
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center dark:bg-hal-darkCard dark:border-hal-darkBorder/40">
            <p className="text-xs text-slate-400">No organizational records found matching search queries.</p>
          </div>
        )}
      </div>

    </div>
  );
}
