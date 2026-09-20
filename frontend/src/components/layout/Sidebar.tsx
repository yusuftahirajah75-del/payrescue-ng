import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  ShieldAlert,
  LayoutDashboard,
  HelpCircle,
  FolderOpen,
  Receipt,
  FileCheck2,
  Building2,
  GitCompare,
  Key,
  CreditCard,
  Users,
  ShieldCheck,
  Activity,
  Sliders,
  LogOut,
  X,
  History,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, activeBusiness, logout } = useAuth();

  const isBusinessUser =
    user?.role === 'BUSINESS_OWNER' ||
    user?.role === 'BUSINESS_ADMIN' ||
    user?.role === 'BUSINESS_AGENT' ||
    (user?.businessMembers && user.businessMembers.length > 0);

  const isAdminUser = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-base font-bold font-display text-slate-900">
              PAYRESCUE <span className="text-[9px] px-1 py-0.5 rounded bg-brand-100 text-brand-800">NG</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Section: Consumer Portal */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Consumer Dispute
            </div>
            <nav className="space-y-1">
              <NavLink to="/dashboard" end className={navLinkClass} onClick={onClose}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </NavLink>
              <NavLink to="/where-is-my-money" className={navLinkClass} onClick={onClose}>
                <HelpCircle className="w-4 h-4 text-brand-600" />
                <span className="font-bold text-brand-600">Where Is My Money?</span>
              </NavLink>
              <NavLink to="/cases" className={navLinkClass} onClick={onClose}>
                <FolderOpen className="w-4 h-4" />
                <span>Rescue Cases</span>
              </NavLink>
              <NavLink to="/evidence" className={navLinkClass} onClick={onClose}>
                <FileCheck2 className="w-4 h-4" />
                <span>Evidence Vault</span>
              </NavLink>
              <NavLink to="/transactions" className={navLinkClass} onClick={onClose}>
                <Receipt className="w-4 h-4" />
                <span>Transaction Ledger</span>
              </NavLink>
            </nav>
          </div>

          {/* Section: Business Infrastructure */}
          {isBusinessUser && (
            <div>
              <div className="px-3 mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Merchant Hub</span>
                {activeBusiness && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 truncate max-w-[80px]">
                    {activeBusiness.name}
                  </span>
                )}
              </div>
              <nav className="space-y-1">
                <NavLink to="/business" end className={navLinkClass} onClick={onClose}>
                  <Building2 className="w-4 h-4" />
                  <span>Business Dashboard</span>
                </NavLink>
                <NavLink to="/business/reconciliation" className={navLinkClass} onClick={onClose}>
                  <GitCompare className="w-4 h-4" />
                  <span>Payment Reconciliation</span>
                </NavLink>
                <NavLink to="/business/verify" className={navLinkClass} onClick={onClose}>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Payment Verification</span>
                </NavLink>
                <NavLink to="/business/requests" className={navLinkClass} onClick={onClose}>
                  <Receipt className="w-4 h-4" />
                  <span>Payment Requests</span>
                </NavLink>
                <NavLink to="/business/team" className={navLinkClass} onClick={onClose}>
                  <Users className="w-4 h-4" />
                  <span>Team Members</span>
                </NavLink>
                <NavLink to="/business/developer" className={navLinkClass} onClick={onClose}>
                  <Key className="w-4 h-4" />
                  <span>TrustPay API & Keys</span>
                </NavLink>
                <NavLink to="/business/billing" className={navLinkClass} onClick={onClose}>
                  <CreditCard className="w-4 h-4" />
                  <span>Plans & Billing</span>
                </NavLink>
              </nav>
            </div>
          )}

          {/* Section: Admin Platform */}
          {isAdminUser && (
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-rose-500">
                Administration
              </div>
              <nav className="space-y-1">
                <NavLink to="/admin" end className={navLinkClass} onClick={onClose}>
                  <Activity className="w-4 h-4" />
                  <span>Admin Overview</span>
                </NavLink>
                <NavLink to="/admin/users" className={navLinkClass} onClick={onClose}>
                  <Users className="w-4 h-4" />
                  <span>Users Directory</span>
                </NavLink>
                <NavLink to="/admin/audit-logs" className={navLinkClass} onClick={onClose}>
                  <History className="w-4 h-4" />
                  <span>Security Audit Logs</span>
                </NavLink>
                <NavLink to="/admin/settings" className={navLinkClass} onClick={onClose}>
                  <Sliders className="w-4 h-4" />
                  <span>Settings & Flags</span>
                </NavLink>
              </nav>
            </div>
          )}
        </div>

        {/* User Footer / Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                {user?.firstName?.[0] || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
