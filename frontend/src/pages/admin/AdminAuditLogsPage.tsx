import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  ShieldAlert, 
  Clock, 
  RefreshCw,
  Terminal,
  Activity
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { formatDate } from '../../utils/formatters';

export const AdminAuditLogsPage: React.FC = () => {
  const { data: logs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => adminApi.listAuditLogs(100),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            System Security Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable log of all administrative actions, regulatory escalations, and cryptographic signatures.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} loading={isFetching}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Refresh Stream
        </Button>
      </div>

      <Card title={`Audit Events Logged (${logs.length})`}>
        {isLoading ? (
          <div className="p-4 space-y-3">
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-10 w-full" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            No audit logs captured yet. System activities will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Entity / Target</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-6">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log: any, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-50/75 transition-colors font-mono">
                    <td className="py-3.5 px-6 text-slate-500 whitespace-nowrap">
                      {formatDate(log.createdAt || new Date().toISOString())}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {log.user?.fullName || log.userId || 'SYSTEM'}
                    </td>
                    <td className="py-3.5 px-4 text-brand-600">
                      {log.entityType || 'DISPUTE_CASE'}: {log.entityId?.slice(0, 8) || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 font-sans max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : 'Completed successfully'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
