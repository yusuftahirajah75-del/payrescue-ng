import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  MoreVertical, 
  UserCheck, 
  UserX,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import { User } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, roleFilter, searchTerm],
    queryFn: () => adminApi.listUsers({
      page,
      limit: 10,
      role: roleFilter || undefined,
      search: searchTerm || undefined,
    }),
  });

  const users = data?.items || [];
  const pagination = data?.pagination;

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      adminApi.updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      addToast('success', 'User status updated');
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to update status');
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">
          User & Identity Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Supervise registered consumers, business tenants, and compliance agents.
        </p>
      </div>

      {/* Filters */}
      <Card noPadding className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="w-full md:w-60">
            <Select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All Roles' },
                { value: 'CONSUMER', label: 'Consumers' },
                { value: 'BUSINESS_ADMIN', label: 'Business Admins' },
                { value: 'BUSINESS_AGENT', label: 'Finance Agents' },
                { value: 'SUPPORT_AGENT', label: 'Support Agents' },
                { value: 'SUPER_ADMIN', label: 'Super Admins' },
              ]}
            />
          </div>

          <div className="w-full md:w-72">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              icon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card noPadding>
        {isLoading ? (
          <div className="p-6 space-y-4">
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-10 w-full" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No users match your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-6">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900">{u.fullName}</div>
                      <div className="text-slate-400 text-[11px] font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {u.phoneNumber || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        u.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-red-50 text-red-700'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {u.status === 'ACTIVE' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => statusMutation.mutate({ userId: u.id, status: 'SUSPENDED' })}
                        >
                          <UserX className="w-3.5 h-3.5 mr-1" /> Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => statusMutation.mutate({ userId: u.id, status: 'ACTIVE' })}
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1" /> Activate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>Page {pagination.page} of {pagination.totalPages}</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
