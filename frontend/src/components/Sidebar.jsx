import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../App';
import { 
  LayoutDashboard, 
  FileCheck, 
  AlertOctagon, 
  FolderGit2, 
  FolderOpen, 
  Sparkles, 
  Database, 
  BarChart3, 
  ShieldAlert, 
  ScrollText,
  LogOut,
  Plane,
  Users
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Administrator', 'Project Manager', 'Engineer', 'Employee'] },
    { name: 'Decision Archive', path: '/decisions', icon: FileCheck, roles: ['Administrator', 'Project Manager', 'Engineer', 'Employee'] },
    { name: 'Smart Issue Tracker', path: '/issues', icon: AlertOctagon, roles: ['Administrator', 'Project Manager', 'Engineer', 'Employee'] },
    { name: 'Project Center', path: '/projects', icon: FolderGit2, roles: ['Administrator', 'Project Manager', 'Engineer', 'Employee'] },
    { name: 'Document Vault', path: '/documents', icon: FolderOpen, roles: ['Administrator', 'Project Manager', 'Engineer', 'Employee'] },
    { name: 'AI Chat Assistant', path: '/ai', icon: Sparkles, roles: ['Administrator', 'Project Manager', 'Engineer', 'Employee'] },
    { name: 'Knowledge Hub', path: '/knowledge', icon: Database, roles: ['Administrator', 'Project Manager', 'Engineer', 'Employee'] },
    { name: 'Analytics Board', path: '/analytics', icon: BarChart3, roles: ['Administrator', 'Project Manager', 'Engineer', 'Employee'] },
    { name: 'Employee Management', path: '/employees', icon: Users, roles: ['Administrator'] },
    { name: 'Security Audit Logs', path: '/logs', icon: ScrollText, roles: ['Administrator'] }
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="w-64 bg-hal-navy text-slate-100 flex flex-col h-full border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80 bg-slate-950/20">
        <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-400/20">
          <Plane className="h-5 w-5 text-sky-400 rotate-45" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-wide leading-none text-white">HAL's BRAIN</h1>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Digital Memory Portal</span>
        </div>
      </div>

      {/* User Quick Info */}
      <div className="p-4 mx-3 my-4 bg-slate-900/40 border border-slate-800/60 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-sky-900/30 flex items-center justify-center font-bold text-sky-400 border border-sky-800/50">
            {user?.name?.charAt(0)}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-white truncate">{user?.name}</h4>
            <span className="text-[10px] text-sky-400 font-medium">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {filteredMenu.map(item => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 group
                ${isActive 
                  ? 'bg-sky-500/10 text-sky-400 border-l-2 border-sky-400 font-semibold' 
                  : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-100'
                }
              `}
            >
              <IconComponent className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Log out section */}
      <div className="p-3 border-t border-slate-850 mt-auto bg-slate-950/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Exit System</span>
        </button>
      </div>
    </aside>
  );
}
