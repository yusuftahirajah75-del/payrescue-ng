import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  PlusCircle, 
  TrendingUp, 
  Search,
  ExternalLink,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { casesApi } from '../../api/cases.api';
import { analyticsApi } from '../../api/analytics.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CaseStatusBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { formatNaira, formatDate } from '../../utils/formatters';

export const ConsumerDashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['consumer-analytics'],
    queryFn: () => analyticsApi.getOverview(),
  });

  const { data: recentCasesData, isLoading: isCasesLoading } = useQuery({
    queryKey: ['consumer-recent-cases'],
    queryFn: () => casesApi.listCases({ limit: 5 }),
  });

  const cases = recentCasesData?.items || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-brand-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-3 border border-brand-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
            Active Protection Active
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white mb-2">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Member'}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            PayRescue enforces your CBN & NCC statutory consumer rights. Track failed transfers, initiate recovery cases, and generate audit-grade evidence packages.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/consumer/where-is-my-money">
              <Button variant="primary" size="md" className="shadow-lg shadow-brand-900/50">
                <Zap className="w-4 h-4 mr-2" />
                Where Is My Money?
              </Button>
            </Link>
            <Link to="/consumer/cases">
              <Button variant="outline" size="md" className="border-white/30 text-white hover:bg-white/10">
                View All Cases
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-brand-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-brand-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Recovered</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-display">
                {isAnalyticsLoading ? (
                  <LoadingSkeleton className="h-8 w-24" />
                ) : (
                  formatNaira(analytics?.financialRecovery?.totalRecoveredNgn || 0)
                )}
              </h3>
            </div>
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-brand-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Direct to your bank account
          </div>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Disputes</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-display">
                {isAnalyticsLoading ? (
                  <LoadingSkeleton className="h-8 w-12" />
                ) : (
                  analytics?.cases?.active ?? 0
                )}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-slate-500">
            Within CBN statutory SLA period
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Escalated to CBN</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-display">
                {isAnalyticsLoading ? (
                  <LoadingSkeleton className="h-8 w-12" />
                ) : (
                  analytics?.cases?.escalated ?? 0
                )}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-amber-600 font-medium">
            Pending regulatory determination
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Resolution Rate</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-display">
                {isAnalyticsLoading ? (
                  <LoadingSkeleton className="h-8 w-16" />
                ) : (
                  analytics?.cases?.resolutionRate ?? '98.4%'
                )}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-emerald-600 font-medium">
            Standard recovery timeline &lt; 72h
          </div>
        </Card>
      </div>

      {/* Quick Action Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/consumer/where-is-my-money" className="block">
          <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-brand-500 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-slate-900 flex items-center justify-between">
              Dispute a Transaction
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Start our 5-step guided wizard for instant classification and SLA protection.
            </p>
          </div>
        </Link>

        <Link to="/consumer/evidence" className="block">
          <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mb-3">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-slate-900 flex items-center justify-between">
              Evidence Vault
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Upload debit alert receipts with automatic SHA-256 cryptographic hashing.
            </p>
          </div>
        </Link>

        <Link to="/consumer/transactions" className="block">
          <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-purple-500 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-slate-900 flex items-center justify-between">
              Transaction Ledger
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              View your recorded bank and telco transactions or attach them to open disputes.
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Rescue Cases Table */}
      <Card
        title="Recent Rescue Cases"
        subtitle="One transaction → one rescue case"
        headerAction={
          <Link to="/consumer/cases">
            <Button variant="ghost" size="sm">
              View All ({recentCasesData?.pagination?.total ?? cases.length})
            </Button>
          </Link>
        }
      >
        {isCasesLoading ? (
          <div className="space-y-3 py-4">
            <LoadingSkeleton className="h-12 w-full" />
            <LoadingSkeleton className="h-12 w-full" />
            <LoadingSkeleton className="h-12 w-full" />
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">No Rescue Cases Filed Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              If a bank debit failed to deliver value or an ATM dispensed incomplete cash, initiate a dispute immediately.
            </p>
            <Link to="/consumer/where-is-my-money">
              <Button variant="primary" size="sm">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Launch First Rescue Case
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-6">Case Number</th>
                  <th className="py-3 px-4">Title / Category</th>
                  <th className="py-3 px-4">Claim Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Filed On</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-medium text-slate-900">
                      {c.caseNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 line-clamp-1">{c.title}</div>
                      <div className="text-slate-400 text-[11px]">{c.category.replace(/_/g, ' ')}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {formatNaira(c.claimAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <CaseStatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link to={`/consumer/cases/${c.id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                          Open Dossier
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
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
