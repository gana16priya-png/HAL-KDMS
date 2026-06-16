import { API_URL } from '../config';
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import {
  Plus,
  Search,
  User,
  Mail,
  Building,
  ShieldAlert,
  ShieldCheck,
  Edit,
  Trash2,
  Key,
  UserPlus,
  Briefcase,
  X,
  Phone,
  UserX,
  UserCheck
} from 'lucide-react';
import { divisionsList } from '../utils/divisions';

export default function EmployeeManagement() {
  const { token, user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Form states (Add)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState(divisionsList[0]);
  const [designation, setDesignation] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Employee');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states (Edit)
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editEmpId, setEditEmpId] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, [token]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/auth/users', {
        headers: { 'Authorization': `Bearer ${ token }` }
      });
      if (res.ok) {
        const list = await res.json();
        setEmployees(list);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !employeeId || !department || !designation || !password) {
      return setError('Please fill in all mandatory text blocks.');
    }

    try {
      const res = await fetch(`${ API_URL } / auth / users', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
        body: JSON.stringify({
          name,
          email,
          employeeId,
          department,
          designation,
          password,
          phone,
          role
        })
      });

    const data = await res.json();
    if (res.ok) {
      setSuccess('Employee account created successfully.');
      // Reset form
      setName('');
      setEmail('');
      setEmployeeId('');
      setDesignation('');
      setPassword('');
      setPhone('');
      setRole('Employee');
      fetchEmployees();
      setTimeout(() => {
        setShowAddModal(false);
        setSuccess('');
      }, 1500);
    } else {
      setError(data.message || 'Failed to add employee.');
    }
  } catch (err) {
    setError('Connection with gateway refused.');
  }
};

const handleOpenEdit = (emp) => {
  setSelectedEmp(emp);
  setEditName(emp.name);
  setEditEmail(emp.email);
  setEditEmpId(emp.employeeId);
  setEditDept(emp.department);
  setEditDesignation(emp.designation || '');
  setEditPhone(emp.phone || '');
  setEditStatus(emp.status);
  setEditRole(emp.role);
  setEditPassword('');
  setEditError('');
  setEditSuccess('');
  setShowEditModal(true);
};

const handleEditEmployee = async (e) => {
  e.preventDefault();
  setEditError('');
  setEditSuccess('');

  try {
    const res = await fetch(`/api/auth/users/${selectedEmp.id || selectedEmp._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: editName,
        email: editEmail,
        employeeId: editEmpId,
        department: editDept,
        designation: editDesignation,
        phone: editPhone,
        status: editStatus,
        role: editRole,
        password: editPassword || undefined
      })
    });

    const data = await res.json();
    if (res.ok) {
      setEditSuccess('Employee profile updated successfully.');
      fetchEmployees();
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccess('');
      }, 1500);
    } else {
      setEditError(data.message || 'Failed to update employee details.');
    }
  } catch (err) {
    setEditError('Connection failed.');
  }
};

const handleDeleteEmployee = async (id) => {
  if (id === user.id) {
    alert('For safety reasons, you cannot delete your own account.');
    return;
  }

  if (!window.confirm('Are you sure you want to permanently delete this employee account?')) {
    return;
  }

  try {
    const res = await fetch(`/api/auth/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      fetchEmployees();
    } else {
      const data = await res.json();
      alert(data.message || 'Failed to delete employee account.');
    }
  } catch (err) {
    console.error(err);
  }
};

const handleToggleStatus = async (emp) => {
  if (emp.id === user.id) {
    alert('You cannot deactivate your own administrator profile.');
    return;
  }

  const nextStatus = emp.status === 'active' ? 'deactivated' : 'active';
  try {
    const res = await fetch(`/api/auth/users/${emp.id || emp._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: nextStatus })
    });

    if (res.ok) {
      fetchEmployees();
    } else {
      const data = await res.json();
      alert(data.message || 'Failed to change status.');
    }
  } catch (err) {
    console.error(err);
  }
};

// Autogenerate a random ID
const handleAutoGenerateId = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  setEmployeeId(`HAL-2026-${randomNum}`);
};

// Filters logic
const filteredEmployees = employees.filter(emp => {
  const matchesSearch =
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    (emp.designation && emp.designation.toLowerCase().includes(search.toLowerCase()));

  const matchesDept = filterDept === 'All' || emp.department === filterDept;
  const matchesStatus = filterStatus === 'All' || emp.status === filterStatus;

  return matchesSearch && matchesDept && matchesStatus;
});

return (
  <div className="space-y-6 max-w-7xl mx-auto font-sans">

    {/* Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-850 dark:text-white">Employee Management</h2>
        <p className="text-xs text-slate-500 font-light mt-1">Directly add, modify, deactivate, or purge employee profiles and operational clearance scopes.</p>
      </div>
      <button
        onClick={() => { setError(''); setSuccess(''); setShowAddModal(true); }}
        className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
      >
        <UserPlus className="h-4 w-4" />
        <span>Add Employee</span>
      </button>
    </div>

    {/* Toolbar Filters */}
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 dark:bg-hal-darkCard dark:border-hal-darkBorder/40 flex flex-wrap gap-3 items-center">

      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
          <Search className="h-4.5 w-4.5" />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, ID, designation, email..."
          className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-white"
        />
      </div>

      {/* Division Filter */}
      <div className="relative">
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-350 appearance-none"
        >
          <option value="All">All Divisions</option>
          {divisionsList.map(div => (
            <option key={div} value={div}>{div}</option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="relative">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-650 focus:outline-none dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-350 appearance-none"
        >
          <option value="All">All Statuses</option>
          <option value="active">Active</option>
          <option value="deactivated">Deactivated</option>
          <option value="pending_activation">Pending Activation</option>
        </select>
      </div>

    </div>

    {/* Directory Table Grid */}
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden dark:bg-hal-darkCard dark:border-hal-darkBorder/40 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 dark:bg-slate-950/20 dark:border-slate-800">
            <tr>
              <th className="px-5 py-3">Employee Details</th>
              <th className="px-5 py-3">Employee ID</th>
              <th className="px-5 py-3">Division & Designation</th>
              <th className="px-5 py-3">Password (Demo)</th>
              <th className="px-5 py-3">Clearance / Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-5 py-10 text-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-hal-navy border-t-transparent dark:border-sky-400 dark:border-t-transparent mx-auto"></div>
                </td>
              </tr>
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.map(emp => (
                <tr key={emp.id || emp._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-400/20 text-sky-400 flex items-center justify-center font-bold">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-white block leading-none">{emp.name}</span>
                        <span className="text-[10px] text-slate-400 mt-1 block flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{emp.email}</span>
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-slate-500 dark:text-slate-455">
                    {emp.employeeId || 'N/A'}
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-350">
                    <div className="space-y-0.5">
                      <span className="font-semibold block flex items-center gap-1">
                        <Building className="h-3.5 w-3.5 text-sky-450 shrink-0" />
                        <span>{emp.department}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block">{emp.designation || 'Specialist'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-indigo-400">
                    <span className="bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-[11px] select-all font-semibold">
                      {emp.plainPassword || '••••••••'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">{emp.role}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded font-bold uppercase text-[9px] border ${emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        emp.status === 'deactivated' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${emp.status === 'active' ? 'bg-emerald-500' :
                          emp.status === 'deactivated' ? 'bg-red-500' : 'bg-amber-500'
                          }`}></span>
                        <span>{emp.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(emp)}
                        className={`p-2 rounded-lg border transition-colors ${emp.status === 'active'
                          ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/40'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/40'
                          }`}
                        title={emp.status === 'active' ? 'Deactivate employee profile' : 'Activate employee profile'}
                      >
                        {emp.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="p-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                        title="Edit employee details"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id || emp._id)}
                        className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/35"
                        title="Purge employee account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-5 py-10 text-center text-slate-400 font-light">
                  No employees matched the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* Add Employee Modal */}
    {showAddModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-lg w-full p-6 dark:bg-hal-darkCard dark:border-hal-darkBorder relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => setShowAddModal(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5 dark:border-slate-800">
            <UserPlus className="h-5 w-5 text-sky-400" />
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">Configure Employee Profile</h3>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-red-550/10 border border-red-500/20 rounded-xl text-xs text-red-500 flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-500 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleAddEmployee} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Lt. Cdr. Arjun Nair"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Employee ID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. HAL-2026-9021"
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAutoGenerateId}
                    className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 rounded-xl transition-all font-semibold text-[10px] shrink-0 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Security Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="arjun.nair@hal-india.co.in"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">HAL Division</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                >
                  {divisionsList.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Designation</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Lead Aerodynamics Engineer"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Clearance Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Security Password</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all mt-4"
            >
              Save Employee Profile
            </button>
          </form>
        </div>
      </div>
    )}

    {/* Edit Employee Modal */}
    {showEditModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl max-w-lg w-full p-6 dark:bg-hal-darkCard dark:border-hal-darkBorder relative max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => setShowEditModal(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-5 dark:border-slate-800">
            <Edit className="h-5 w-5 text-sky-400" />
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">Modify Employee Profile</h3>
          </div>

          {editError && (
            <div className="mb-4 p-3.5 bg-red-550/10 border border-red-500/20 rounded-xl text-xs text-red-500 flex items-start gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{editError}</span>
            </div>
          )}

          {editSuccess && (
            <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-500 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{editSuccess}</span>
            </div>
          )}

          <form onSubmit={handleEditEmployee} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Employee ID</label>
                <input
                  type="text"
                  required
                  value={editEmpId}
                  onChange={(e) => setEditEmpId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Security Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">HAL Division</label>
                <select
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                >
                  {divisionsList.map(div => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Designation</label>
                <input
                  type="text"
                  required
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  disabled={selectedEmp?.id === user.id}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white disabled:opacity-50"
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  disabled={selectedEmp?.id === user.id}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white disabled:opacity-50"
                >
                  <option value="active">Active</option>
                  <option value="deactivated">Deactivated</option>
                  <option value="pending_activation">Pending Activation</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold flex items-center gap-1">
                  <Key className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  <span>Reset Password</span>
                </label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="New password (demo)"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none dark:bg-slate-900 dark:border-slate-800 dark:text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all mt-4"
            >
              Update Employee Profile
            </button>
          </form>
        </div>
      </div>
    )}

  </div>
);
}
