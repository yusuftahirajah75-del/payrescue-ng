import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShieldAlert, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Copy, 
  Upload, 
  ExternalLink,
  Lock,
  Building2,
  Calendar,
  Send,
  Download,
  FileCheck2,
  HelpCircle,
  Hash
} from 'lucide-react';
import { casesApi } from '../../api/cases.api';
import { complaintsApi } from '../../api/complaints.api';
import { evidenceApi } from '../../api/evidence.api';
import { ocrApi } from '../../api/ocr.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { CaseStatusBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { formatNaira, formatDate } from '../../utils/formatters';
import { CaseStatus } from '../../types';

export const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'dossier' | 'evidence' | 'complaint' | 'timeline'>('dossier');

  // Escalation modal state
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [targetRegulator, setTargetRegulator] = useState('CENTRAL_BANK_OF_NIGERIA');

  // Evidence upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceHash, setEvidenceHash] = useState('');
  const [isHashing, setIsHashing] = useState(false);

  // Status update modal (for business/agent/admin)
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<CaseStatus>('RESOLVED');
  const [statusSummary, setStatusSummary] = useState('');

  // Fetch case details
  const { data: caseItem, isLoading } = useQuery({
    queryKey: ['case-detail', id],
    queryFn: () => casesApi.getCaseById(id!),
    enabled: !!id,
  });

  // Complaint query
  const { data: complaintData, refetch: refetchComplaint, isLoading: isComplaintLoading } = useQuery({
    queryKey: ['case-complaint', id],
    queryFn: () => complaintsApi.generateComplaint(id!),
    enabled: !!id && activeTab === 'complaint',
  });

  // Escalation mutation
  const escalateMutation = useMutation({
    mutationFn: (data: { reason: string; targetRegulator: string }) => 
      casesApi.escalateCase(id!, data),
    onSuccess: () => {
      addToast('success', `Case escalated directly to ${targetRegulator}!`);
      setIsEscalateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['case-detail', id] });
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Escalation failed');
    }
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: (data: { status: CaseStatus; summary: string }) =>
      casesApi.updateStatus(id!, data),
    onSuccess: () => {
      addToast('success', 'Case status successfully updated');
      setIsStatusUpdateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['case-detail', id] });
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to update status');
    }
  });

  // Hash calculation for evidence upload
  const handleEvidenceFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEvidenceFile(file);
    setIsHashing(true);
    try {
      const buffer = await file.arrayBuffer();
      const digestBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(digestBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setEvidenceHash(hashHex);
    } catch {
      addToast('error', 'Hashing failed');
    } finally {
      setIsHashing(false);
    }
  };

  const handleUploadEvidence = async () => {
    if (!evidenceFile || !id) return;
    try {
      const form = new FormData();
      form.append('file', evidenceFile);
      form.append('caseId', id);
      form.append('documentType', 'BANK_STATEMENT');
      if (evidenceHash) form.append('sha256Hash', evidenceHash);

      await evidenceApi.uploadEvidence(form);
      addToast('success', 'Evidence securely registered and hashed');
      setIsUploadOpen(false);
      setEvidenceFile(null);
      setEvidenceHash('');
      queryClient.invalidateQueries({ queryKey: ['case-detail', id] });
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Upload failed');
    }
  };

  const handleTriggerOcr = async (evidenceId: string) => {
    try {
      addToast('info', 'Running OCR analysis on evidence document...');
      await ocrApi.extractEvidence(evidenceId);
      addToast('success', 'OCR extraction completed');
      queryClient.invalidateQueries({ queryKey: ['case-detail', id] });
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'OCR extraction failed');
    }
  };

  const copyComplaintToClipboard = () => {
    const text = complaintData?.bodyText || (complaintData as any)?.contentBody;
    if (text) {
      navigator.clipboard.writeText(text);
      addToast('success', 'Formal complaint letter copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-28 w-full rounded-2xl" />
        <LoadingSkeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">Rescue Case Not Found</h3>
        <p className="text-xs text-slate-500 mt-1 mb-6">The specified case ID does not exist or you do not have permission to view it.</p>
        <Link to="/consumer/cases">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cases
          </Button>
        </Link>
      </div>
    );
  }

  const isStaff = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'BUSINESS_ADMIN' || user?.role === 'BUSINESS_AGENT';

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/consumer/cases" className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back to Case Ledger
      </Link>

      {/* Dossier Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                CASE #{caseItem.caseNumber}
              </span>
              <CaseStatusBadge status={caseItem.status} />
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                {caseItem.priority} PRIORITY
              </span>
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-900">
              {caseItem.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Category: <span className="font-medium text-slate-700">{caseItem.category.replace(/_/g, ' ')}</span> &bull; Filed on {formatDate(caseItem.createdAt)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {isStaff && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsStatusUpdateOpen(true)}
              >
                Update Status
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsUploadOpen(true)}
            >
              <Upload className="w-4 h-4 mr-1.5" />
              Attach Evidence
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setIsEscalateOpen(true)}
              disabled={caseItem.status === 'ESCALATED' || caseItem.status === 'CLOSED'}
            >
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              Escalate to CBN
            </Button>
          </div>
        </div>

        {/* Claim Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <div className="text-slate-400 font-medium">Claimed Amount</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {formatNaira(caseItem.claimAmount)}
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Statutory SLA Window</div>
            <div className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              {caseItem.slaDeadline ? formatDate(caseItem.slaDeadline) : '72h Standard'}
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Evidence Vault Items</div>
            <div className="font-semibold text-slate-800 mt-0.5">
              {caseItem.evidence?.length || 0} Cryptographically Verified
            </div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Regulator Reference</div>
            <div className="font-mono font-semibold text-slate-800 mt-0.5 truncate">
              {caseItem.complaints?.[0]?.regulatorReference || caseItem.complaints?.[0]?.complaintRef || 'CBN-PENDING'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('dossier')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'dossier'
                ? 'border-brand-600 text-brand-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Dossier & Details
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'evidence'
                ? 'border-brand-600 text-brand-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Evidence Vault
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[11px]">
              {caseItem.evidence?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('complaint')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'complaint'
                ? 'border-brand-600 text-brand-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Regulator Complaint Package
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-brand-600 text-brand-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Audit Timeline
          </button>
        </nav>
      </div>

      {/* Tab 1: Dossier */}
      {activeTab === 'dossier' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Dispute Statement">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {caseItem.description || 'No detailed statement provided.'}
              </p>
              {caseItem.resolutionNotes && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                  <div className="font-bold flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Resolution Summary:
                  </div>
                  {caseItem.resolutionNotes}
                </div>
              )}
            </Card>

            {caseItem.transaction && (
              <Card title="Linked Transaction Record">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Public Reference:</span>
                    <p className="font-mono font-medium text-slate-900 mt-0.5 break-all">
                      {caseItem.transaction.publicReference}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Transaction Status:</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {caseItem.transaction.status}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Channel / Type:</span>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {caseItem.transaction.channel || 'NIP Transfer'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Transaction Date:</span>
                    <p className="text-slate-800 mt-0.5">
                      {formatDate(caseItem.transaction.transactionTimestamp)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Sender Identifier:</span>
                    <p className="font-mono text-slate-800 mt-0.5">
                      {caseItem.transaction.senderIdentifier || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Recipient Identifier:</span>
                    <p className="font-mono text-slate-800 mt-0.5">
                      {caseItem.transaction.recipientIdentifier || 'N/A'}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card title="Statutory Rights & Rules">
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">CBN Circular BSD/DIR/GEN/LAB/11/025</span>
                  Banks must reverse failed intra-bank transfers instantly, and inter-bank transfers within 72 hours maximum.
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block mb-1">NCC Consumer Code of Practice</span>
                  Unfulfilled airtime or data recharges must be credited or refunded within 24 hours of filing.
                </div>
              </div>
            </Card>

            <Card title="Direct Contacts">
              <div className="text-xs space-y-2 text-slate-600">
                <div>
                  <span className="font-semibold text-slate-800">CBN Consumer Protection:</span>
                  <p className="font-mono text-brand-600">cpd@cbn.gov.ng</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-800">FCCPC Complaints Desk:</span>
                  <p className="font-mono text-brand-600">contact@fccpc.gov.ng</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Evidence Vault */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900 text-white text-xs flex items-start gap-3">
            <Lock className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-brand-400">PayRescue Cryptographic Trust Notice</div>
              <p className="text-slate-300 mt-1">
                Every evidence artifact is timestamped and secured with an immutable SHA-256 digest. PayRescue enforces that <em>“Evidence uploaded ≠ payment verified”</em> until settlement confirmation is achieved through our reconciliation engine.
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-slate-900">
              Registered Evidence Files ({caseItem.evidence?.length || 0})
            </h3>
            <Button variant="primary" size="sm" onClick={() => setIsUploadOpen(true)}>
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload New Document
            </Button>
          </div>

          {(!caseItem.evidence || caseItem.evidence.length === 0) ? (
            <Card>
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-slate-700">No Evidence Attached Yet</h4>
                <p className="text-xs text-slate-400 mt-1 mb-4">Attach bank debit screenshots, receipts, or statement extracts.</p>
                <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(true)}>
                  Upload First Artifact
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {caseItem.evidence.map((ev) => (
                <div key={ev.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 truncate max-w-xs">{ev.fileName}</h4>
                        <p className="text-[11px] text-slate-400 capitalize">{ev.documentType.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {(ev.fileSizeBytes / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  {/* SHA-256 Badge */}
                  <div className="p-2 rounded bg-slate-50 border border-slate-100 text-[10px] font-mono text-slate-600 break-all">
                    <span className="text-slate-400 font-semibold font-sans">SHA-256: </span>
                    {ev.sha256Hash}
                  </div>

                  {/* OCR section */}
                  {ev.ocrExtraction ? (
                    <div className="p-2.5 rounded-lg bg-brand-50/60 border border-brand-200/50 text-[11px] space-y-1">
                      <div className="font-bold text-brand-800 flex items-center gap-1">
                        <FileCheck2 className="w-3.5 h-3.5 text-brand-600" />
                        OCR Extracted Data
                      </div>
                      <div className="text-slate-700">
                        <span className="font-semibold">Extracted Ref: </span> 
                        {ev.ocrExtraction.extractedReference || 'N/A'}
                      </div>
                      <div className="text-slate-700">
                        <span className="font-semibold">Extracted Amount: </span> 
                        {ev.ocrExtraction.extractedAmount ? formatNaira(ev.ocrExtraction.extractedAmount) : 'N/A'}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">OCR not run yet</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-[11px] text-brand-600"
                        onClick={() => handleTriggerOcr(ev.id)}
                      >
                        Extract OCR Data
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Regulator Complaint Package */}
      {activeTab === 'complaint' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold font-display text-slate-900">
                Statutory Regulator Complaint Letter
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically drafted legal notice formatted in accordance with CBN Consumer Protection Department guidelines.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyComplaintToClipboard}
              >
                <Copy className="w-4 h-4 mr-1.5" />
                Copy Letter
              </Button>
            </div>
          </div>

          {isComplaintLoading ? (
            <LoadingSkeleton className="h-64 w-full rounded-xl" />
          ) : (
            <Card>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                {complaintData?.bodyText || (complaintData as any)?.contentBody || 'Generating statutory complaint package...'}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Tab 4: Audit Timeline */}
      {activeTab === 'timeline' && (
        <Card title="Immutable Audit Timeline">
          <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 my-2">
            <div className="relative">
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-brand-600 ring-4 ring-white" />
              <div className="text-xs font-bold text-slate-900">Rescue Case Opened</div>
              <p className="text-[11px] text-slate-500 mt-0.5">{formatDate(caseItem.createdAt)}</p>
              <p className="text-xs text-slate-600 mt-1">Dispute initiated by consumer. Statutory SLA activated.</p>
            </div>

            {caseItem.slaDeadline && (
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-white" />
                <div className="text-xs font-bold text-slate-900">CBN Statutory SLA Deadline</div>
                <p className="text-[11px] text-slate-500 mt-0.5">{formatDate(caseItem.slaDeadline)}</p>
                <p className="text-xs text-slate-600 mt-1">Provider must resolve transaction reversal before this timestamp.</p>
              </div>
            )}

            {caseItem.status === 'RESOLVED' && (
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-600 ring-4 ring-white" />
                <div className="text-xs font-bold text-slate-900">Transaction Reversal Confirmed</div>
                <p className="text-xs text-emerald-700 mt-1 font-medium">Funds successfully credited back to consumer account.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Escalation Modal */}
      <Modal
        isOpen={isEscalateOpen}
        onClose={() => setIsEscalateOpen(false)}
        title="Escalate Case to Regulatory Body"
        subtitle="This action dispatches a formal complaint dossier directly to Nigerian financial regulators."
      >
        <div className="space-y-4">
          <Select
            label="Target Regulatory Authority"
            value={targetRegulator}
            onChange={(e) => setTargetRegulator(e.target.value)}
            options={[
              { value: 'CENTRAL_BANK_OF_NIGERIA', label: 'Central Bank of Nigeria (CBN CPD)' },
              { value: 'FCCPC', label: 'Federal Competition & Consumer Protection Commission (FCCPC)' },
              { value: 'NCC', label: 'Nigerian Communications Commission (NCC)' },
            ]}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Escalation Justification & Breach Reason
            </label>
            <textarea
              className="w-full text-xs rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
              rows={3}
              placeholder="e.g. 72 hours elapsed without reversal despite valid session ID and debit confirmation."
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsEscalateOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              loading={escalateMutation.isPending}
              onClick={() => escalateMutation.mutate({ reason: escalateReason, targetRegulator })}
            >
              Dispatch Regulatory Notice
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Evidence Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Attach Evidence to Vault"
        subtitle="Upload debit alerts, receipts, or PDF statements with automatic SHA-256 hashing."
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center">
            <input 
              type="file" 
              id="attach-file" 
              className="hidden" 
              accept="image/*,application/pdf"
              onChange={handleEvidenceFileSelect}
            />
            <label htmlFor="attach-file">
              <Button 
                variant="outline" 
                size="sm" 
                type="button" 
                onClick={() => document.getElementById('attach-file')?.click()}
              >
                Choose File
              </Button>
            </label>
            {evidenceFile && (
              <div className="mt-3 text-xs text-left">
                <div className="font-semibold text-slate-800">{evidenceFile.name}</div>
                {isHashing ? (
                  <p className="text-brand-600 mt-1">Calculating SHA-256...</p>
                ) : evidenceHash ? (
                  <p className="text-[10px] font-mono text-slate-500 break-all mt-1">{evidenceHash}</p>
                ) : null}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              disabled={!evidenceFile || isHashing}
              onClick={handleUploadEvidence}
            >
              Secure into Vault
            </Button>
          </div>
        </div>
      </Modal>

      {/* Status Update Modal (for Staff) */}
      <Modal
        isOpen={isStatusUpdateOpen}
        onClose={() => setIsStatusUpdateOpen(false)}
        title="Update Case Status"
        subtitle="Authorized action to progress or resolve dispute."
      >
        <div className="space-y-4">
          <Select
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as CaseStatus)}
            options={[
              { value: 'PROVIDER_REVIEW', label: 'Provider Review' },
              { value: 'EVIDENCE_REQUIRED', label: 'Evidence Requested' },
              { value: 'ESCALATED', label: 'Escalated to Provider/Regulator' },
              { value: 'RESOLVED', label: 'Resolved (Funds Recovered)' },
              { value: 'REJECTED', label: 'Rejected' },
              { value: 'CLOSED', label: 'Closed' },
            ]}
          />

          <Input
            label="Resolution / Status Summary"
            placeholder="e.g. Bank processed recall ref #9482749"
            value={statusSummary}
            onChange={(e) => setStatusSummary(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsStatusUpdateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={statusMutation.isPending}
              onClick={() => statusMutation.mutate({ status: newStatus, summary: statusSummary })}
            >
              Commit Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
