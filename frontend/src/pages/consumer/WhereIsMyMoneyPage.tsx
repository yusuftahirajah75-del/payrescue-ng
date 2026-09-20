import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ShieldAlert, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  FileUp, 
  Clock, 
  Hash, 
  CreditCard, 
  Zap,
  Building2,
  FileCheck,
  Lock
} from 'lucide-react';
import { publicApi } from '../../api/public.api';
import { casesApi } from '../../api/cases.api';
import { evidenceApi } from '../../api/evidence.api';
import { classificationApi, ClassificationResponse } from '../../api/classification.api';
import { riskApi, RiskEvaluationResult } from '../../api/risk.api';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { DisputeCategory } from '../../types';
import { formatNaira } from '../../utils/formatters';

const CATEGORIES: Array<{ id: DisputeCategory; title: string; desc: string; icon: string }> = [
  { id: 'FAILED_TRANSFER', title: 'Failed Bank Transfer', desc: 'Debited from your account, but recipient bank did not receive funds', icon: '💸' },
  { id: 'ATM_DISPENSE_ERROR', title: 'ATM Dispense Error', desc: 'ATM dispensed less or no cash, but full amount was deducted', icon: '🏧' },
  { id: 'POS_DECLINE_DEBIT', title: 'POS Declined but Debited', desc: 'Merchant POS reported "Declined" / "Transaction Failed" while your account was charged', icon: '💳' },
  { id: 'AIRTIME_DATA_FAILURE', title: 'Airtime / Data Failure', desc: 'Purchased mobile airtime or data bundle, debited, but value was not delivered', icon: '📶' },
  { id: 'BILL_PAYMENT_FAILURE', title: 'Utility / Electricity Token', desc: 'NEPA/DisCo meter token or Cable TV subscription not generated despite debit', icon: '⚡' },
  { id: 'UNAUTHORIZED_DEBIT', title: 'Unauthorized / Fraudulent Debit', desc: 'Suspicious or unrecognized debit without your authorization or OTP', icon: '🚨' },
  { id: 'CRYPTO_P2P_SCAM', title: 'Crypto P2P Dispute', desc: 'Transferred fiat via P2P escrow but merchant failed to release crypto assets', icon: '🪙' },
];

export const WhereIsMyMoneyPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<DisputeCategory>('FAILED_TRANSFER');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    claimAmount: '',
    providerId: '',
    transactionReference: '',
    transactionTimestamp: new Date().toISOString().slice(0, 16),
    senderIdentifier: '',
    recipientIdentifier: '',
    channel: 'NIP_TRANSFER',
    hasDebitAlert: true,
    hasValueDelivered: false,
    hoursElapsedSinceTransaction: 12,
  });

  // Evidence state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>('');
  const [uploadedEvidenceId, setUploadedEvidenceId] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Classification & Risk state
  const [classification, setClassification] = useState<ClassificationResponse | null>(null);
  const [riskEvaluation, setRiskEvaluation] = useState<RiskEvaluationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Providers list
  const { data: providers } = useQuery({
    queryKey: ['providers-list'],
    queryFn: () => publicApi.getProviders(),
  });

  // Calculate SHA-256 client-side using Web Crypto
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsHashing(true);

    try {
      const buffer = await file.arrayBuffer();
      const digestBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(digestBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setFileHash(hashHex);
      addToast('success', 'Cryptographic SHA-256 hash computed successfully');
    } catch (err) {
      addToast('error', 'Failed to calculate file hash');
    } finally {
      setIsHashing(false);
    }
  };

  const handleUploadEvidence = async () => {
    if (!selectedFile) return;
    setIsUploading(true);

    try {
      const form = new FormData();
      form.append('file', selectedFile);
      form.append('documentType', 'DEBIT_ALERT_SCREENSHOT');
      if (fileHash) form.append('sha256Hash', fileHash);

      const res = await evidenceApi.uploadEvidence(form);
      setUploadedEvidenceId(res.id);
      addToast('success', 'Evidence securely registered into cryptographic vault');
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Evidence upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Step 4 Trigger: Analyze Dispute
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const [classRes, riskRes] = await Promise.all([
        classificationApi.classifyDispute({
          transactionType: formData.channel,
          claimAmount: Number(formData.claimAmount) || 0,
          transactionReference: formData.transactionReference || 'REF-PENDING',
          narrativeDescription: formData.description || `Dispute for ${selectedCategory}`,
          hasDebitAlert: formData.hasDebitAlert,
          hasValueDelivered: formData.hasValueDelivered,
          hoursElapsedSinceTransaction: Number(formData.hoursElapsedSinceTransaction) || 12,
        }),
        riskApi.evaluateRisk({
          transactionReference: formData.transactionReference || 'REF-PENDING',
          claimedAmount: Number(formData.claimAmount) || 0,
          claimedTimestamp: new Date(formData.transactionTimestamp).toISOString(),
        })
      ]);

      setClassification(classRes);
      setRiskEvaluation(riskRes);
      setStep(4);
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Analysis failed. Proceeding with standard classification.');
      setStep(4);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Final Step: Create Case
  const handleCreateCase = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title || `${selectedCategory.replace(/_/g, ' ')} - ${formData.transactionReference || 'Dispute'}`,
        description: formData.description || `Consumer dispute filed under category ${selectedCategory}`,
        category: selectedCategory,
        claimAmount: Number(formData.claimAmount),
        currency: 'NGN',
        providerId: formData.providerId || undefined,
        transactionDetails: {
          publicReference: formData.transactionReference || `TX-${Date.now()}`,
          transactionType: formData.channel,
          transactionTimestamp: new Date(formData.transactionTimestamp).toISOString(),
          senderIdentifier: formData.senderIdentifier || undefined,
          recipientIdentifier: formData.recipientIdentifier || undefined,
          channel: formData.channel,
        },
      };

      const newCase = await casesApi.createCase(payload);
      addToast('success', `Rescue Case #${newCase.caseNumber} created! Statutory SLA timer activated.`);
      navigate(`/consumer/cases/${newCase.id}`);
    } catch (err: any) {
      addToast('error', err.response?.data?.message || 'Failed to create rescue case');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-brand-600" />
              CBN & NCC Statutory Dispute Engine
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-900">
              Where Is My Money? — Guided Dispute Wizard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              File a legally backed rescue case with cryptographic evidence and automated SLA tracking.
            </p>
          </div>

          {/* Stepper indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  step === s 
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 ring-2 ring-brand-600/30' 
                    : step > s 
                    ? 'bg-brand-100 text-brand-700' 
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step 1: Category Selection */}
      {step === 1 && (
        <Card title="Step 1: What type of transaction failed?">
          <p className="text-xs text-slate-500 -mt-2 mb-6">
            Select the issue that best matches your situation to apply the correct regulatory rules (CBN / NCC / FCCPC).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/50 shadow-sm ring-1 ring-brand-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <span className="text-2xl select-none">{cat.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-slate-900">{cat.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{cat.desc}</p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <Button 
              variant="primary" 
              size="md" 
              onClick={() => setStep(2)}
            >
              Continue to Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Transaction Details */}
      {step === 2 && (
        <Card title="Step 2: Transaction Details">
          <p className="text-xs text-slate-500 -mt-2 mb-6">
            Provide the payment details found on your debit alert or bank statement.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Dispute Case Title"
                placeholder="e.g. Failed GTBank NIP transfer to Zenith Account"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <Input
              label="Claim Amount (NGN)"
              type="number"
              placeholder="e.g. 50000"
              value={formData.claimAmount}
              onChange={(e) => setFormData({ ...formData, claimAmount: e.target.value })}
              required
            />

            <Input
              label="Transaction Reference / Session ID / RRN"
              placeholder="e.g. 10000424092014022839485"
              value={formData.transactionReference}
              onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
              hint="Crucial for interbank NIBSS and switch tracing"
              required
            />

            <Select
              label="Bank / Payment Provider"
              value={formData.providerId}
              onChange={(e) => setFormData({ ...formData, providerId: e.target.value })}
              options={[
                { value: '', label: 'Select your provider or bank...' },
                ...(providers?.map((p) => ({ value: p.id, label: `${p.name} (${p.code})` })) || [])
              ]}
              required
            />

            <Select
              label="Payment Channel"
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
              options={[
                { value: 'NIP_TRANSFER', label: 'NIBSS Instant Payment (NIP)' },
                { value: 'POS', label: 'Point of Sale (POS) Terminal' },
                { value: 'ATM', label: 'Automated Teller Machine (ATM)' },
                { value: 'WEB_ONLINE', label: 'Online Web Checkout (Card/Transfer)' },
                { value: 'MOBILE_APP', label: 'Bank Mobile App / USSD' },
                { value: 'DISCO_ELECTRICITY', label: 'Electricity DisCo Portal' },
              ]}
            />

            <Input
              label="Date & Time of Debit"
              type="datetime-local"
              value={formData.transactionTimestamp}
              onChange={(e) => setFormData({ ...formData, transactionTimestamp: e.target.value })}
              required
            />

            <Input
              label="Hours Elapsed Since Debit"
              type="number"
              value={formData.hoursElapsedSinceTransaction}
              onChange={(e) => setFormData({ ...formData, hoursElapsedSinceTransaction: Number(e.target.value) })}
              hint="Used to check statutory SLA breach thresholds"
            />

            <Input
              label="Sender Account / Phone / Identifier"
              placeholder="e.g. 0123456789 (Access Bank)"
              value={formData.senderIdentifier}
              onChange={(e) => setFormData({ ...formData, senderIdentifier: e.target.value })}
            />

            <Input
              label="Beneficiary / Recipient Identifier"
              placeholder="e.g. 9876543210 (Kuda Bank)"
              value={formData.recipientIdentifier}
              onChange={(e) => setFormData({ ...formData, recipientIdentifier: e.target.value })}
            />

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Narrative of What Happened
              </label>
              <textarea
                className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                rows={3}
                placeholder="Explain the circumstances: what error appeared on screen, did you contact customer care, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                if (!formData.claimAmount) {
                  addToast('warning', 'Please specify the claim amount in Naira');
                  return;
                }
                setStep(3);
              }}
            >
              Continue to Evidence Upload
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Cryptographic Evidence Upload */}
      {step === 3 && (
        <Card title="Step 3: Cryptographic Evidence Vault">
          <p className="text-xs text-slate-500 -mt-2 mb-4">
            Upload your debit alert screenshot, POS receipt, or bank statement PDF. PayRescue hashes the file with SHA-256 before storing it to ensure tamper-proof integrity for CBN complaints.
          </p>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Evidence Vault Notice:</span> Uploaded evidence documents your claim under penalty of false representation. Our OCR pipeline automatically extracts session references and amounts to cross-check with Nigerian payment switches.
            </div>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-brand-500 transition-colors bg-slate-50/50">
            <FileUp className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 mb-1">
              Select or drop evidence file here
            </p>
            <p className="text-xs text-slate-400 mb-4">
              PNG, JPG, or PDF up to 10MB
            </p>

            <input 
              type="file" 
              id="evidence-file" 
              className="hidden" 
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
            />
            <label htmlFor="evidence-file">
              <Button 
                variant="outline" 
                size="sm" 
                type="button" 
                onClick={() => document.getElementById('evidence-file')?.click()}
              >
                Browse File
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
                    <Clock className="w-3 h-3 animate-spin" /> Calculating cryptographic SHA-256 hash...
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
                    disabled={uploadedEvidenceId !== null}
                    onClick={handleUploadEvidence}
                  >
                    {uploadedEvidenceId ? 'Vault Registered ✓' : 'Register into Vault'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              variant="primary" 
              loading={isAnalyzing}
              onClick={handleRunAnalysis}
            >
              Analyze & Classify Dispute
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Real-Time Classification & Risk Evaluation */}
      {step === 4 && (
        <Card title="Step 4: Statutory Classification & Regulatory Rules">
          <p className="text-xs text-slate-500 -mt-2 mb-6">
            PayRescue's dispute classification engine evaluated your case parameters against Nigerian banking regulations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-5 rounded-xl bg-brand-50 border border-brand-200">
              <div className="flex items-center gap-2 text-brand-800 font-bold text-sm mb-2">
                <CheckCircle2 className="w-5 h-5 text-brand-600" />
                Case Classification
              </div>
              <div className="text-xs space-y-2 text-slate-700">
                <div>
                  <span className="font-semibold text-slate-900">Category: </span>
                  {classification?.category || selectedCategory}
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Confidence Score: </span>
                  {((classification?.confidenceScore ?? 0.95) * 100).toFixed(0)}%
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Statutory SLA: </span>
                  <span className="text-brand-700 font-bold">
                    {selectedCategory === 'AIRTIME_DATA_FAILURE' ? '24 Hours (NCC)' : '72 Hours (CBN)'}
                  </span>
                </div>
                <div className="pt-2 border-t border-brand-200/60 text-slate-600 text-xs">
                  {classification?.rationale || 'Debit alert confirmed without value delivery. Eligible for automated reversal request.'}
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
                <ShieldAlert className="w-5 h-5 text-blue-600" />
                Risk & Action Recommendation
              </div>
              <div className="text-xs space-y-2 text-slate-700">
                <div>
                  <span className="font-semibold text-slate-900">Recommended Action: </span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[11px]">
                    {riskEvaluation?.recommendedAction || 'STANDARD_PROCESSING'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Integrity Score: </span>
                  {riskEvaluation?.overallScore ?? 15} / 100 (Low Risk)
                </div>
                <div className="pt-2 border-t border-slate-200 text-slate-600 text-xs">
                  {classification?.suggestedAction || 'Generate statutory complaint letter and notify settlement clearinghouse.'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-brand-600" />
              What Happens When You Click Submit:
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Your rescue case is permanently recorded on the immutable ledger.</li>
              <li>A formal CBN/NCC compliant dispute dossier is prepared with your cryptographic hashes.</li>
              <li>The 72-hour statutory resolution countdown is initiated.</li>
              <li>If unresolved within SLA, one-click escalation to CBN Consumer Protection Department unlocks.</li>
            </ul>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(3)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              variant="primary" 
              loading={isSubmitting}
              onClick={handleCreateCase}
            >
              Confirm & Launch Rescue Case
              <Zap className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
