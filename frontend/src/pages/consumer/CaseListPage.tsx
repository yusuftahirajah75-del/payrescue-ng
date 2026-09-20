import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  ExternalLink, 
  ShieldAlert, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { casesApi } from '../../api/cases.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { CaseStatusBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { CaseStatus } from '../../types';
import { formatNaira, formatDate } from '../../utils/formatters';

const STATUS_FILTERS: Array<{ label: string; value: CaseStatus | '' }> = [
  { label: 'All Cases', value: '' },
  { label: 'Submitted', value: 'SUBMITTED' },
  { label: 'Under Review', value: 'PROVIDER_REVIEW' },
  { label: 'Escalated', value: 'ESCALATED' },
  { label: 'Resolved', value: 'RESOLVED' },
  { label: 'Closed', value: 'CLOSED' },
];

export const CaseListPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<CaseStatus | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['cases-list', page, statusFilter, searchTerm],
    queryFn: () => casesApi.listCases({
      page,
      limit,
      status: statusFilter ? (statusFilter as CaseStatus) : undefined,
      search: searchTerm || undefined,
    }),
  });

  const cases = data?.items || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Rescue Cases Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage all your active transaction dispute cases and statutory SLA countdowns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            loading={isFetching}
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
          <Link to="/consumer/where-is-my-money">
            <Button variant="primary" size="sm">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              New Rescue Case
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card noPadding className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.label}
                onClick={() => {
                  setStatusFilter(f.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === f.value
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="w-full md:w-72">
            <Input
              placeholder="Search by case # or title..."
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

      {/* Cases Table */}
      <Card noPadding>
        {isLoading ? (
          <div className="p-6 space-y-4">
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-10 w-full" />
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="text-base font-semibold text-slate-800">No Rescue Cases Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              {statusFilter || searchTerm 
                ? 'No cases match your current filter parameters.' 
                : 'You have no open or recorded transaction disputes.'}
            </p>
            <Link to="/consumer/where-is-my-money">
              <Button variant="primary" size="sm">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Launch Where Is My Money?
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6">Case Number</th>
                  <th className="py-3.5 px-4">Title / Category</th>
                  <th className="py-3.5 px-4">Claimed Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">SLA Deadline</th>
                  <th className="py-3.5 px-4">Date Filed</th>
                  <th className="py-3.5 px-6 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-slate-900">
                      {c.caseNumber}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800 line-clamp-1 max-w-xs">{c.title}</div>
                      <div className="text-slate-400 text-[11px] capitalize">{c.category.toLowerCase().replace(/_/g, ' ')}</div>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {formatNaira(c.claimAmount)}
                    </td>
                    <td className="py-4 px-4">
                      <CaseStatusBadge status={c.status} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-slate-600 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>{c.slaDeadline ? formatDate(c.slaDeadline) : '72h Standard'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link to={`/consumer/cases/${c.id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                          View Dossier
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

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total cases)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
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
