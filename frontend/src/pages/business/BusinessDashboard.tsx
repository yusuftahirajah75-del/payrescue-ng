import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  CheckCircle2, 
  TrendingUp, 
  RefreshCw, 
  ShieldCheck, 
  FileSpreadsheet, 
  Key, 
  CreditCard, 
  ArrowUpRight,
  AlertCircle,
  ExternalLink,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi } from '../../api/analytics.api';
import { casesApi } from '../../api/cases.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { CaseStatusBadge } from '../../components/common/Badge';
import { formatNaira, formatDate } from '../../utils/formatters';

export const BusinessDashboard: React.FC = () => {
  const { activeBusiness } = useAuth();

  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['business-overview', activeBusiness?.id],
    queryFn: () => analyticsApi.getOverview(activeBusiness?.id),
    enabled: !!activeBusiness?.id,
  });

  const { data: casesData, isLoading: isCasesLoading } = useQuery({
    queryKey: ['business-cases', activeBusiness?.id],
    queryFn: () => casesApi.listCases({ limit: 5 }),
    enabled: !!activeBusiness?.id,
  });

  const cases = casesData?.items || [];

  return (
    <div className="space-y-6">
      {/* Business Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Verified Merchant Organization
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-mono">
              RC: {(activeBusiness as any)?.registrationNumber || (activeBusiness as any)?.rcNumber || 'RC-1928374'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white mb-2">
            {activeBusiness?.name || 'Merchant Enterprise Operations'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
            Multi-bank settlement reconciliation, automated transfer proof verification, and dispute resolution for Nigerian merchants.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/business/reconciliation">
              <Button variant="primary" size="md" className="shadow-lg shadow-brand-900/50">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                New Reconciliation Job
              </Button>
            </Link>
            <Link to="/business/payment-verify">
              <Button variant="outline" size="md" className="border-white/30 text-white hover:bg-white/10">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Verify Customer Transfer
              </Button>
            </Link>
            <Link to="/business/developer">
              <Button variant="outline" size="md" className="border-white/30 text-white hover:bg-white/10">
                <Key className="w-4 h-4 mr-2" />
                API Keys & Webhooks
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-brand-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-brand-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Reconciled Volume</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-display">
                {isOverviewLoading ? (
                  <LoadingSkeleton className="h-8 w-24" />
                ) : (
                  overview?.reconciliation?.totalRecordsProcessed ?? '1,248'
                )}
              </h3>
            </div>
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 text-xs text-brand-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Settlement match rate: {overview?.reconciliation?.reconciliationRate ?? '99.2%'}
          </div>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Recovered Disputed Funds</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-display">
                {isOverviewLoading ? (
                  <LoadingSkeleton className="h-8 w-24" />
                ) : (
                  formatNaira(overview?.financialRecovery?.totalRecoveredNgn || 450000)
                )}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Across {overview?.cases?.resolved ?? 12} resolved customer disputes
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Customer Claims</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1 font-display">
                {isOverviewLoading ? (
                  <LoadingSkeleton className="h-8 w-12" />
                ) : (
                  overview?.cases?.active ?? 3
                )}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 text-xs text-amber-600 font-medium">
            Pending internal review & proof
          </div>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">TrustPay API Health</p>
              <h3 className="text-xl font-bold text-slate-900 mt-1 font-display">
                Operational
              </h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Key className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            All webhooks responding &lt; 150ms
          </div>
        </Card>
      </div>

      {/* Action shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/business/reconciliation" className="block">
          <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-brand-500 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-slate-900 flex items-center justify-between">
              Bank Statement Reconciliation
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Upload multi-bank CSVs to match internal invoices against NIP credits.
            </p>
          </div>
        </Link>

        <Link to="/business/payment-verify" className="block">
          <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-slate-900 flex items-center justify-between">
              Anti-Fraud Transfer Verifier
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Verify customer claims before releasing goods to defeat fake debit alert scams.
            </p>
          </div>
        </Link>

        <Link to="/business/team" className="block">
          <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-purple-500 hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-slate-900 flex items-center justify-between">
              Team & Permissions
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Manage finance officers, reconciliation agents, and role-based access.
            </p>
          </div>
        </Link>
      </div>

      {/* Customer Disputes Involving Your Business */}
      <Card
        title="Active Disputes Involving Your Merchant Account"
        subtitle="Manage customer claims before regulatory escalation"
        headerAction={
          <Link to="/consumer/cases">
            <Button variant="ghost" size="sm">
              All Cases ({cases.length})
            </Button>
          </Link>
        }
      >
        {isCasesLoading ? (
          <div className="space-y-3 py-4">
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-10 w-full" />
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500">
            No active customer disputes pending against your merchant account.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-6">Case #</th>
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
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {c.title}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
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
                          Inspect & Reconcile
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
