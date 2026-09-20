import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, CheckCircle2, AlertTriangle, RefreshCw, Server, Database, Shield } from 'lucide-react';
import { publicApi } from '../../api/public.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const PublicStatusPage: React.FC = () => {
  const { data: status, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['public', 'status'],
    queryFn: publicApi.getStatus,
    refetchInterval: 15000,
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-brand-600" />
            PayRescue System Status
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time operational monitoring of dispute submission pipelines and reconciliation APIs.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          isLoading={isFetching}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Status
        </Button>
      </div>

      {/* Global Status Banner */}
      <Card
        className={`${
          status?.status === 'OPERATIONAL'
            ? 'bg-emerald-950 text-emerald-100 border-emerald-900'
            : 'bg-amber-950 text-amber-100 border-amber-900'
        } p-6`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
            {status?.status === 'OPERATIONAL' ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-amber-400" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold font-display">
              {status?.status === 'OPERATIONAL' ? 'All Systems Fully Operational' : 'Partial Service Degradation'}
            </h2>
            <p className="text-xs opacity-80 mt-0.5">
              Dispute ingestion pipelines, bank adapters, and reconciliation engines are responding normally.
            </p>
          </div>
        </div>
      </Card>

      {/* Components List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Core Infrastructure Components</h3>
        <Card className="divide-y divide-slate-100 p-0">
          {status?.components ? (
            Object.entries(status.components).map(([name, compStatus]) => (
              <div key={name} className="flex items-center justify-between p-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    {name.includes('database') ? (
                      <Database className="w-4 h-4" />
                    ) : name.includes('evidence') ? (
                      <Shield className="w-4 h-4" />
                    ) : (
                      <Server className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 capitalize">
                      {name.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">HTTP 200 health ping</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {compStatus}
                </span>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">Loading component health...</div>
          )}
        </Card>
      </div>

      {/* Process Uptime Metrics */}
      {status && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <Card className="p-4">
            <span className="text-slate-400 text-[10px] font-bold uppercase">System Uptime</span>
            <p className="text-lg font-bold font-display text-slate-900 mt-1">
              {(status.uptimeSeconds / 3600).toFixed(1)} Hours
            </p>
          </Card>
          <Card className="p-4">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Environment</span>
            <p className="text-lg font-bold font-display text-slate-900 mt-1 capitalize">
              {status.environment}
            </p>
          </Card>
          <Card className="p-4">
            <span className="text-slate-400 text-[10px] font-bold uppercase">Last Checked</span>
            <p className="text-lg font-bold font-display text-slate-900 mt-1">
              {new Date(status.timestamp).toLocaleTimeString('en-NG')}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};
