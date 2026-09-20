import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ExternalLink, 
  ShieldAlert, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  PlusCircle,
  Filter
} from 'lucide-react';
import { transactionsApi } from '../../api/transactions.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { formatNaira, formatDate } from '../../utils/formatters';

export const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['transactions-ledger', page, statusFilter, searchTerm],
    queryFn: () => transactionsApi.listTransactions({
      page,
      limit,
      status: statusFilter || undefined,
      reference: searchTerm || undefined,
    }),
  });

  const transactions = data?.items || [];
  const pagination = data?.pagination;

  const renderStatus = (status: string) => {
    switch (status) {
      case 'SUCCESSFUL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Successful
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
            <XCircle className="w-3 h-3" /> Failed
          </span>
        );
      case 'DISPUTED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            <AlertCircle className="w-3 h-3" /> Disputed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Transaction Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative, immutable transaction log for bank transfers, card debits, and utility payments.
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
              Dispute a Transaction
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <Card noPadding className="p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto">
            {['', 'SUCCESSFUL', 'FAILED', 'DISPUTED', 'PENDING'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatusFilter(s);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>

          <div className="w-full md:w-72">
            <Input
              placeholder="Search reference or session ID..."
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

      {/* Transactions Table */}
      <Card noPadding>
        {isLoading ? (
          <div className="p-6 space-y-4">
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-10 w-full" />
            <LoadingSkeleton className="h-10 w-full" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-800">No Transactions Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {searchTerm || statusFilter 
                ? 'No transactions match your search filter.' 
                : 'Your transaction records will appear here as you submit disputes or sync payments.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-6">Reference / Session ID</th>
                  <th className="py-3.5 px-4">Channel</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Sender / Recipient</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-slate-900">
                      {tx.publicReference}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-700">
                      {tx.channel || 'NIP_TRANSFER'}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {formatNaira(tx.amount)}
                    </td>
                    <td className="py-4 px-4">
                      {renderStatus(tx.status)}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      <div className="truncate max-w-[160px]">To: {tx.recipientIdentifier || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[160px]">From: {tx.senderIdentifier || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {formatDate(tx.transactionTimestamp)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {tx.status === 'FAILED' || tx.status === 'DISPUTED' ? (
                        <Link to={`/consumer/where-is-my-money`}>
                          <Button variant="primary" size="sm" className="h-7 text-xs px-2.5">
                            Rescue Case
                          </Button>
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Reconciled</span>
                      )}
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
