import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../App';

export default function ProtectedRoute({ children }) {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-hal-darkBg">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-hal-navy border-t-transparent dark:border-sky-400 dark:border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Authenticating with HAL's BRAIN Security Portal...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
