import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <span className="text-xs font-semibold text-slate-500">Restoring session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const RoleGuard: React.FC<{ allowedRoles: Role[]; children: React.ReactNode }> = ({
  allowedRoles,
  children,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'SUPER_ADMIN') return <>{children}</>;

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 my-8">
        <h2 className="text-lg font-bold text-rose-600 font-display">Access Denied</h2>
        <p className="text-xs text-slate-500 mt-2">
          Your account role ({user.role}) does not have permission to view this section.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export const TenantGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeBusiness, user } = useAuth();

  if (!activeBusiness && user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 my-8">
        <h2 className="text-lg font-bold text-slate-900 font-display">Business Context Required</h2>
        <p className="text-xs text-slate-500 mt-2">
          This section requires an active business profile. Please register or join an organization.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
