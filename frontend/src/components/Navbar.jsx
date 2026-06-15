import React, { useContext, useState, useEffect } from 'react';
import { AuthContext, ThemeContext } from '../App';
import { Sun, Moon, Bell, Search, Globe, ShieldAlert, Cpu } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getDivisionByName } from '../utils/divisions';

export default function Navbar() {
  const { user } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Seed notification indicators
  useEffect(() => {
    setNotifications([
      { id: 1, type: 'critical', text: 'Critical Issue Ticket Raised: Afterburner Fluid flutter in HTT-40 engine testing.', time: '10 min ago' },
      { id: 2, type: 'decision', text: 'Decision Approved: Titanium Grade-5 usage on Su-30 mounts.', time: '2 hours ago' },
      { id: 3, type: 'sla', text: 'SLA Escalation Alert: Hydraulic Leak ticket approaching 24h milestone.', time: 'Yesterday' }
    ]);
  }, []);

  // Calculate user division profile
  const userDiv = getDivisionByName(user?.department);
  const DivIcon = userDiv.icon;

  // Build breadcrumbs
  const pathnames = location.pathname.split('/').filter(x => x);
  const breadcrumbs = [
    { label: 'Home', path: '/dashboard' }
  ];
  if (pathnames.length > 0 && pathnames[0] !== 'dashboard') {
    const route = pathnames[0];
    const mapping = {
      decisions: 'Decision Archive',
      issues: 'Smart Issue Tracker',
      projects: 'Project Center',
      documents: 'Document Vault',
      ai: 'AI Assistant',
      knowledge: 'Knowledge Hub',
      analytics: 'Analytics Board',
      employees: 'Employee Management',
      admin: 'Admin Panel',
      logs: 'Security Audit Logs',
      'activate-account': 'Activate Account'
    };
    breadcrumbs.push({ label: mapping[route] || route.charAt(0).toUpperCase() + route.slice(1), path: `/${route}` });
  }

  return (
    <header className="h-16 border-b border-slate-200 bg-white/75 backdrop-blur-md px-6 flex items-center justify-between shrink-0 dark:bg-hal-darkCard/85 dark:border-hal-darkBorder/40">
      
      {/* Left side: Breadcrumbs and Division Profile */}
      <div className="flex items-center gap-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-350 dark:text-slate-700">/</span>}
              {idx === breadcrumbs.length - 1 ? (
                <span className="text-slate-800 dark:text-white font-bold">{crumb.label}</span>
              ) : (
                <Link to={crumb.path} className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Division Profile badge */}
        {user && (
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-slate-300 dark:text-slate-750">|</span>
            <div 
              className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-semibold transition-all ${userDiv.color.light} ${userDiv.color.dark}`} 
              title={userDiv.description}
            >
              <DivIcon className="h-3.5 w-3.5" />
              <span>{userDiv.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        
        {/* Toggle Dark Mode */}
        <button
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle UI Theme"
        >
          {darkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
        </button>

        {/* Notifications Alert Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="h-4.5 w-4.5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-xl py-2 z-50 dark:bg-hal-darkCard dark:border-hal-darkBorder">
              <div className="px-4 py-2 border-b border-slate-150 flex items-center justify-between dark:border-hal-darkBorder">
                <span className="font-semibold text-xs text-slate-800 dark:text-white">Active System Notifications</span>
                <span className="text-[10px] text-sky-500 font-semibold uppercase">{notifications.length} alerts</span>
              </div>
              
              <div className="max-h-64 overflow-y-auto">
                {notifications.map(item => (
                  <div key={item.id} className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 dark:border-hal-darkBorder/40 dark:hover:bg-slate-800/40 flex gap-3 text-xs">
                    <div className="mt-0.5">
                      {item.type === 'critical' ? (
                        <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
                      ) : item.type === 'decision' ? (
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                      ) : (
                        <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
                      )}
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-300 leading-tight">{item.text}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Identity Display */}
        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-slate-800 dark:text-white block">{user?.name}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{user?.role}</span>
          </div>
        </div>

      </div>
    </header>
  );
}
