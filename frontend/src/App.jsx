import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Layout components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import EmployeeManagement from './pages/EmployeeManagement';
import ActivateAccount from './pages/ActivateAccount';
import Dashboard from './pages/Dashboard';
import DecisionManagement from './pages/DecisionManagement';
import IssueTracker from './pages/IssueTracker';
import ProjectManagement from './pages/ProjectManagement';
import DocumentRepository from './pages/DocumentRepository';
import AIAssistant from './pages/AIAssistant';
import KnowledgeRepository from './pages/KnowledgeRepository';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';
import AuditLogs from './pages/AuditLogs';

// Create Global Contexts
export const AuthContext = createContext(null);
export const ThemeContext = createContext(null);

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  // Sync token with local storage & fetch profile if token exists
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchProfile();
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  // Sync dark mode class with DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('https://hal-kdms-backend.onrender.com/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // Token expired or invalid
        logout();
      }
    } catch (err) {
      console.error('Failed fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />

            {/* Protected internal app routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

// Sidebar/Navbar App Layout Wrapper
function AppLayout() {
  const { logout, user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);

  // Sandbox pending accounts until password is set
  if (user?.status === 'pending_activation') {
    return (
      <Routes>
        <Route path="/activate-account" element={<ActivateAccount />} />
        <Route path="*" element={<Navigate to="/activate-account" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-hal-darkBg">
      {/* Dynamic Navigation Sidebar */}
      <Sidebar />

      {/* Main Panel Content */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-8 grid-aerospace">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/decisions" element={<DecisionManagement />} />
            <Route path="/issues" element={<IssueTracker />} />
            <Route path="/projects" element={<ProjectManagement />} />
            <Route path="/documents" element={<DocumentRepository />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/knowledge" element={<KnowledgeRepository />} />
            <Route path="/analytics" element={<Analytics />} />

            {/* Admin Exclusive routes */}
            <Route path="/employees" element={
              user?.role === 'Administrator' ? <EmployeeManagement /> : <Navigate to="/dashboard" replace />
            } />
            <Route path="/admin" element={
              user?.role === 'Administrator' ? <AdminPanel /> : <Navigate to="/dashboard" replace />
            } />
            <Route path="/logs" element={
              user?.role === 'Administrator' ? <AuditLogs /> : <Navigate to="/dashboard" replace />
            } />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
