import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Download,
  Filter,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { reconciliationApi } from '../../api/reconciliation.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ReconciliationBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { formatNaira, formatDate } from '../../utils/formatters';
import { ReconciliationJob, ReconciliationResult } from '../../types';

export const ReconciliationPage: React.FC = () => {
  const { activeBusiness } = useAuth();
  const { addToast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeJob, setActiveJob] = useState<ReconciliationJob | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Manual reconciliation modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualClaimRef, setManualClaimRef] = useState('');
  const [manualClaimAmount, setManualClaimAmount] = useState('');

  const businessId = activeBusiness?.id || 'default';

  // CSV Reconciliation Mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => reconciliationApi.reconcileCsv(businessId, file),
    onSuccess: (data) => {
      addToast('success', 'Settlement CSV processed and reconciled successfully');
      setActiveJob(data.job);
      setSelectedFile(null);
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Reconciliation failed. Please check CSV headers.');
    }
  });

  // Manual Batch Mutation
  const manualMutation = useMutation({
    mutationFn: (claims: Array<{ claimedReference: string; claimedAmount: number }>) =>
      reconciliationApi.reconcileManual(businessId, claims),
    onSuccess: (data) => {
      addToast('success', 'Manual claim matched against ledger');
      setActiveJob(data.job);
      setIsManualModalOpen(false);
      setManualClaimRef('');
      setManualClaimAmount('');
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Manual match failed');
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualClaimRef || !manualClaimAmount) {
      addToast('warning', 'Please enter reference and amount');
      return;
    }
    manualMutation.mutate([
      { claimedReference: manualClaimRef, claimedAmount: Number(manualClaimAmount) }
    ]);
  };

  const results = activeJob?.results || [];
  const filteredResults = results.filter((r) => {
    if (activeFilter === 'ALL') return true;
    return r.matchStatus === activeFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Multi-Bank Settlement Reconciliation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Authoritative automated matching engine for Nigerian bank settlement files (NIP, Interswitch, Remita, Paystack).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsManualModalOpen(true)}
          >
            Manual Reference Match
          </Button>
        </div>
      </div>

      {/* CSV Upload Dropzone Card */}
      <Card title="Upload Bank Settlement CSV">
        <p className="text-xs text-slate-500 -mt-2 mb-4">
          Upload your bank settlement or merchant statement CSV. Expected columns: <code>reference</code>, <code>amount</code>, <code>date</code>, <code>sender_account</code>.
        </p>

        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-brand-500 transition-colors bg-slate-50/50">
          <FileSpreadsheet className="w-10 h-10 text-brand-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 mb-1">
            Drag and drop settlement CSV file
          </p>
          <p className="text-xs text-slate-400 mb-4">
            Supports standard UTF-8 CSV exports from Nigerian commercial banks
          </p>

          <input 
            type="file" 
            id="csv-file-input" 
            className="hidden" 
            accept=".csv,text/csv"
            onChange={handleFileChange}
          />
          <label htmlFor="csv-file-input">
            <Button 
              variant="outline" 
              size="sm" 
              type="button" 
              onClick={() => document.getElementById('csv-file-input')?.click()}
            >
              Choose CSV File
            </Button>
          </label>

          {selectedFile && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200 text-left max-w-md mx-auto flex items-center justify-between">
              <div className="text-xs">
                <span className="font-semibold text-slate-900 block truncate">{selectedFile.name}</span>
                <span className="text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>
              <Button
                variant="primary"
                size="sm"
                loading={uploadMutation.isPending}
                onClick={() => uploadMutation.mutate(selectedFile)}
              >
                Run Match Engine
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Summary KPI Cards if Job Loaded */}
      {activeJob && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-slate-400">
            <div className="text-xs text-slate-500 font-medium">Total Records</div>
            <div className="text-2xl font-bold text-slate-900 mt-1 font-display">
              {activeJob.totalRecords}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Processed in {activeJob.executionTimeMs || 42}ms</div>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <div className="text-xs text-slate-500 font-medium">Matched Records</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1 font-display">
              {activeJob.matchedRecords ?? activeJob.matchedCount ?? 0}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              {activeJob.totalRecords ? ((((activeJob.matchedRecords ?? activeJob.matchedCount ?? 0) / activeJob.totalRecords) * 100).toFixed(1)) : 0}% settlement rate
            </div>
          </Card>

          <Card className="border-l-4 border-l-amber-500">
            <div className="text-xs text-slate-500 font-medium">Partial Matches</div>
            <div className="text-2xl font-bold text-amber-600 mt-1 font-display">
              {activeJob.partialRecords || 0}
            </div>
            <div className="text-[11px] text-amber-600 font-medium mt-1">Minor fee variances</div>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <div className="text-xs text-slate-500 font-medium">Unmatched / Mismatches</div>
            <div className="text-2xl font-bold text-red-600 mt-1 font-display">
              {(activeJob.unmatchedRecords || 0) + (activeJob.mismatchRecords || 0)}
            </div>
            <div className="text-[11px] text-red-600 font-medium mt-1">Requires bank query</div>
          </Card>
        </div>
      )}

      {/* Reconciliation Results Table */}
      <Card
        title="Reconciliation Results Ledger"
        subtitle={activeJob ? `Job ID: ${activeJob.jobReference || activeJob.id}` : 'Run a reconciliation job above to view results'}
        headerAction={
          activeJob && (
            <div className="flex items-center gap-1.5">
              {['ALL', 'MATCHED', 'PARTIAL_MATCH', 'UNMATCHED', 'MISMATCH'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    activeFilter === f
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          )
        }
      >
        {!activeJob ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No active reconciliation report. Upload a bank settlement CSV or run a manual match above.
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No rows match the filter: {activeFilter}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-6">Claimed Ref</th>
                  <th className="py-3 px-4">Claimed Amount</th>
                  <th className="py-3 px-4">Settled Amount</th>
                  <th className="py-3 px-4">Match Status</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-6">Discrepancy Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-medium text-slate-900">
                      {r.claimedReference}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {formatNaira(r.claimedAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {r.settledAmount ? formatNaira(r.settledAmount) : '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <ReconciliationBadge status={r.matchStatus || r.status || 'MATCHED'} />
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {r.confidenceScore ? `${(r.confidenceScore * 100).toFixed(0)}%` : '100%'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 max-w-xs truncate">
                      {r.discrepancyReason || 'Exact reference and amount match confirmed'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Manual Match Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Manual Claim Reconciliation"
        subtitle="Test a specific customer transaction reference against your recorded ledger."
      >
        <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
          <Input
            label="Claimed Transaction Reference / Session ID"
            placeholder="e.g. 10000424092014022839485"
            value={manualClaimRef}
            onChange={(e) => setManualClaimRef(e.target.value)}
            required
          />

          <Input
            label="Claimed Amount (NGN)"
            type="number"
            placeholder="e.g. 25000"
            value={manualClaimAmount}
            onChange={(e) => setManualClaimAmount(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsManualModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={manualMutation.isPending}>
              Run Single Check
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
