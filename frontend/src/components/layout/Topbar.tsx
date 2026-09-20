import React, { useState } from 'react';
import { Menu, Bell, Building2, ChevronDown, Check, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications.api';
import { formatTimeAgo } from '../../utils/formatters';

interface TopbarProps {
  onOpenSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenSidebar }) => {
  const { user, activeBusiness, setActiveBusinessId } = useAuth();
  const [bizDropdownOpen, setBizDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.listNotifications(true),
    refetchInterval: 30000,
  });

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile trigger & Active context */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Business Selector (if user has business memberships) */}
        {user?.businessMembers && user.businessMembers.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setBizDropdownOpen(!bizDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-brand-600" />
              <span>{activeBusiness?.name || 'Select Business'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {bizDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white border border-slate-100 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Business Tenant
                </div>
                {user.businessMembers.map((m) => (
                  <button
                    key={m.business.id}
                    onClick={() => {
                      setActiveBusinessId(m.business.id);
                      setBizDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <span>{m.business.name}</span>
                    {activeBusiness?.id === m.business.id && (
                      <Check className="w-3.5 h-3.5 text-brand-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Notifications & Profile Pill */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900">Notifications</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 font-semibold">
                  {notifications.length} Unread
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No unread notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
                      <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {formatTimeAgo(n.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Pill */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-700">
              <Shield className="w-2.5 h-2.5" />
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.firstName?.[0] || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};
