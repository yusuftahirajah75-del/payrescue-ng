import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ShieldCheck, 
  FileUp, 
  Lock, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Hash,
  Eye,
  Info
} from 'lucide-react';
import { casesApi } from '../../api/cases.api';
import { evidenceApi } from '../../api/evidence.api';
import { ocrApi } from '../../api/ocr.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatNaira } from '../../utils/formatters';

export const EvidenceVaultPage: React.FC = () => {
  const { addToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [docType, setDocType] = useState('DEBIT_ALERT_SCREENSHOT');

  // Preview / OCR Modal
  const [activeEvidence, setActiveEvidence] = useState<any | null>(null);

  // Get cases to link evidence to
  const { data: casesData } = useQuery({
    queryKey: ['cases-for-evidence'],
    queryFn: () => casesApi.listCases({ limit: 50 }),
  });

  const cases = casesData?.items || [];
  // Collect all evidence across cases
  const allEvidence = cases.flatMap((c) => (c.evidence || []).map((e) => ({ ...e, caseTitle: c.title, caseNumber: c.caseNumber })));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setIsHashing(true);

    try {
      const buffer = await file.arrayBuffer();
      const digestBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(digestBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setFileHash(hashHex);
      addToast('success', 'Computed SHA-256 checksum in browser sandbox');
    } catch {
      addToast('error', 'Could not compute hash');
    } finally {
      setIsHashing(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);

    try {
      const form = new FormData();
      form.append('file', selectedFile);
      form.append('documentType', docType);
      if (selectedCaseId) form.append('caseId', selectedCaseId);
      if (fileHash) form.append('sha256Hash', fileHash);

      await evidenceApi.uploadEvidence(form);
      addToast('success', 'Document registered in cryptographic vault');
      setSelectedFile(null);
      setFileHash('');
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">
          Cryptographic Evidence Vault
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Secure repository for debit alerts, bank statement extracts, and POS receipts with immutable SHA-256 fingerprints.
        </p>
      </div>

      {/* Trust Notice Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-navy-900 to-navy-800 text-white shadow-sm flex items-start gap-3">
        <div className="p-2 rounded-lg bg-brand-500/20 text-brand-300 shrink-0 mt-0.5">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-white">
            Core Regulatory Principle: “Evidence uploaded ≠ payment verified”
          </h4>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Screenshots and alerts substantiate consumer dispute claims for CBN and NCC complaint filings. However, settlement confirmation requires authoritative switch reconciliation. PayRescue computes tamper-proof client-side SHA-256 hashes to prevent document alteration.
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <Card title="Register New Evidence Artifact">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <Select
              label="Document Type"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              options={[
                { value: 'DEBIT_ALERT_SCREENSHOT', label: 'Debit Alert Screenshot' },
                { value: 'POS_RECEIPT', label: 'POS Terminal Receipt' },
                { value: 'ATM_SLIP', label: 'ATM Slip / Physical Receipt' },
                { value: 'BANK_STATEMENT', label: 'Bank Statement PDF' },
                { value: 'CORRESPONDENCE', label: 'Bank Email / Support Chat' },
              ]}
            />
          </div>

          <div className="md:col-span-2">
            <Select
              label="Link to Rescue Case (Optional)"
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              options={[
                { value: '', label: 'None (Store in Personal Vault)' },
                ...cases.map((c) => ({ value: c.id, label: `Case #${c.caseNumber} - ${c.title}` })),
              ]}
            />
          </div>
        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-brand-500 transition-colors bg-slate-50/50">
          <FileUp className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 mb-1">
            Choose a receipt or screenshot
          </p>
          <p className="text-xs text-slate-400 mb-4">
            Supports PNG, JPG, or PDF up to 10MB
          </p>

          <input 
            type="file" 
            id="vault-file" 
            className="hidden" 
            accept="image/*,application/pdf"
            onChange={handleFileChange}
          />
          <label htmlFor="vault-file">
            <Button 
              variant="outline" 
              size="sm" 
              type="button" 
              onClick={() => document.getElementById('vault-file')?.click()}
            >
              Browse Local Files
            </Button>
          </label>

          {selectedFile && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200 text-left max-w-lg mx-auto">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span className="truncate">{selectedFile.name}</span>
                <span className="text-slate-400 font-normal">{(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>

              {isHashing ? (
                <p className="text-[11px] text-brand-600 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 animate-spin" /> Computing SHA-256 hash...
                </p>
              ) : fileHash ? (
                <div className="mt-2 text-[11px] text-slate-600 font-mono bg-slate-100 p-1.5 rounded break-all">
                  <span className="text-slate-400 font-sans font-semibold">SHA-256: </span>
                  {fileHash}
                </div>
              ) : null}

              <div className="mt-3 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  loading={isUploading}
                  disabled={isHashing}
                  onClick={handleUpload}
                >
                  Confirm Vault Registration
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Vault List */}
      <Card title={`Vault Documents (${allEvidence.length})`}>
        {allEvidence.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No evidence documents uploaded yet. Upload receipts or statements above.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-6">File Name</th>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Associated Case</th>
                  <th className="py-3 px-4">Cryptographic Hash</th>
                  <th className="py-3 px-4">OCR Status</th>
                  <th className="py-3 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allEvidence.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                      <span className="truncate max-w-xs">{ev.fileName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 capitalize">
                      {ev.documentType.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3.5 px-4">
                      {ev.caseNumber ? (
                        <span className="font-mono text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                          #{ev.caseNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400">Unlinked</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500 max-w-[150px] truncate" title={ev.sha256Hash}>
                      {ev.sha256Hash}
                    </td>
                    <td className="py-3.5 px-4">
                      {ev.ocrExtraction ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                          OCR Verified
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
                          Pending OCR
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-xs px-2"
                        onClick={() => setActiveEvidence(ev)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Inspect Modal */}
      {activeEvidence && (
        <Modal
          isOpen={!!activeEvidence}
          onClose={() => setActiveEvidence(null)}
          title="Evidence Artifact Dossier"
          subtitle={`SHA-256 Fingerprint: ${activeEvidence.sha256Hash}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
              <div>
                <span className="text-slate-400 block">File Name:</span>
                <span className="font-semibold text-slate-900">{activeEvidence.fileName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Size:</span>
                <span className="font-semibold text-slate-900">{(activeEvidence.fileSizeBytes / 1024).toFixed(1)} KB</span>
              </div>
              <div>
                <span className="text-slate-400 block">Document Type:</span>
                <span className="font-semibold text-slate-900 capitalize">{activeEvidence.documentType.replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Linked Case:</span>
                <span className="font-semibold text-slate-900">
                  {activeEvidence.caseNumber ? `#${activeEvidence.caseNumber}` : 'None'}
                </span>
              </div>
            </div>

            {activeEvidence.ocrExtraction ? (
              <div className="p-3 bg-brand-50 border border-brand-200 rounded-lg space-y-1.5">
                <div className="font-bold text-brand-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  OCR Extracted Intelligence
                </div>
                <div>
                  <span className="text-slate-600 font-semibold">Extracted Reference / Session ID: </span>
                  <span className="font-mono">{activeEvidence.ocrExtraction.extractedReference || 'None'}</span>
                </div>
                <div>
                  <span className="text-slate-600 font-semibold">Extracted Amount: </span>
                  <span>{activeEvidence.ocrExtraction.extractedAmount ? formatNaira(activeEvidence.ocrExtraction.extractedAmount) : 'None'}</span>
                </div>
                <div>
                  <span className="text-slate-600 font-semibold">Raw Text Match: </span>
                  <p className="mt-1 font-mono text-[10px] text-slate-700 bg-white/70 p-2 rounded max-h-32 overflow-y-auto">
                    {activeEvidence.ocrExtraction.rawTextPreview || 'No text preview available'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-100 rounded-lg text-slate-500">
                OCR has not been run on this artifact yet.
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setActiveEvidence(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
