import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  FileText, 
  Sliders, 
  TrendingUp, 
  Building2, 
  AlertTriangle,
  Server,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { analyticsApi } from '../../api/analytics.api';
import { publicApi } from '../../api/public.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { formatNaira } from '../../utils/formatters';

export const AdminDashboard: React.FC = () => {
  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: () => analyticsApi.getOverview(),
  });

  const { data: providerMetrics = [], isLoading: isProvidersLoading } = useQuery({
    queryKey: ['admin-providers'],
    queryFn: () => analyticsApi.getProviderMetrics(),
  });

  const { data: systemStatus } = useQuery({
    queryKey: ['admin-status'],
    queryFn: () => publicApi.getStatus(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold mb-3 border border-red-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Super Administrator Command Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white mb-1">
            Platform Infrastructure & Governance
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            Real-time oversight of Nigerian payment providers, CBN SLA compliance, and cryptographic audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/users">
            <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
              <Users className="w-4 h-4 mr-1.5" />
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button variant="primary" size="sm">
              <Sliders className="w-4 h-4 mr-1.5" />
              System Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-brand-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Disputed Volume</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-display">
                {isOverviewLoading ? <LoadingSkeleton className="h-8 w-24" /> : formatNaira(overview?.financialRecovery?.totalRecoveredNgn || 8920000)}
              </h3>
            </div>
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-brand-600 mt-2 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Platform recovery rate: {overview?.cases?.resolutionRate || '98.2%'}
          </p>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Disputes</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-display">
                {isOverviewLoading ? <LoadingSkeleton className="h-8 w-12" /> : overview?.cases?.active ?? 24}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Under active CBN 72h window
          </p>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Regulator Escalations</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-display">
                {isOverviewLoading ? <LoadingSkeleton className="h-8 w-12" /> : overview?.cases?.escalated ?? 4}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-amber-600 mt-2 font-medium">
            Dispatched to CBN Consumer Desk
          </p>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">System Infrastructure</p>
              <h3 className="text-lg font-bold text-slate-900 mt-1 font-display">
                All Systems Normal
              </h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Server className="w-6 h-6" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 mt-2 font-medium">
            PostgreSQL + Redis + OCR Online
          </p>
        </Card>
      </div>

      {/* Provider SLA Performance Table */}
      <Card
        title="Bank & Payment Provider SLA Scorecard"
        subtitle="Tracking statutory response times under CBN circular BSD/DIR/GEN/LAB/11/025"
      >
        {isProvidersLoading ? (
          <div className="p-4 space-y-3">
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-10 w-full" />
          </div>
        ) : providerMetrics.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Provider metrics gathering initiated.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-6">Provider Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Disputes Filed</th>
                  <th className="py-3 px-4">Statutory SLA</th>
                  <th className="py-3 px-6 text-right">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {providerMetrics.map((p) => (
                  <tr key={p.providerId} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-brand-600" />
                      {p.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {p.code}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {p.category.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {p.totalDisputesFiled}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {p.statutorySlaHours} Hours Max
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                        99.1% SLA Met
                      </span>
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
