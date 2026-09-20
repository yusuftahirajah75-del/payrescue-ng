import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  HelpCircle,
  Copy,
  Receipt
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { verificationApi } from '../../api/verification.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { formatNaira, formatDate } from '../../utils/formatters';
import { VerificationResult } from '../../types';

export const PaymentVerifyPage: React.FC = () => {
  const { activeBusiness } = useAuth();
  const { addToast } = useToast();

  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<VerificationResult | null>(null);

  const businessId = activeBusiness?.id || 'default';

  const verifyMutation = useMutation({
    mutationFn: (data: { claimedReference: string; claimedAmount?: number }) =>
      verificationApi.verifyPayment(businessId, data),
    onSuccess: (data) => {
      setResult(data);
      if (data.isVerified) {
        addToast('success', 'Payment verified! Value delivery safe.');
      } else {
        addToast('warning', 'Payment not confirmed! Do NOT release goods based on SMS alone.');
      }
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Verification check failed');
    }
  });

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference) {
      addToast('warning', 'Please enter the transaction reference');
      return;
    }
    verifyMutation.mutate({
      claimedReference: reference,
      claimedAmount: amount ? Number(amount) : undefined,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">
          Anti-Fraud Transfer Verifier
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Verify bank transfers and customer claims in real-time before releasing goods or crediting balances.
        </p>
      </div>

      {/* Anti-fraud warning */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sm">Merchant Safety Directive:</span>
          <p className="mt-0.5 leading-relaxed">
            Never accept SMS debit alerts or screenshot receipts as proof of payment. Scammers routinely simulate bank alerts using bulk SMS spoofing. Always ensure authoritative settlement via PayRescue before value release.
          </p>
        </div>
      </div>

      {/* Verification Form */}
      <Card title="Instant Payment Verification Query">
        <form onSubmit={handleVerify} className="space-y-4">
          <Input
            label="Transaction Reference / Session ID / RRN"
            placeholder="e.g. 10000424092014022839485"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            hint="Input the 30-digit NIBSS session ID or bank transaction reference"
            required
          />

          <Input
            label="Claimed Amount (NGN) (Optional)"
            type="number"
            placeholder="e.g. 15000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            hint="Validates that the received credit matches the expected order amount"
          />

          <Button
            variant="primary"
            size="md"
            type="submit"
            loading={verifyMutation.isPending}
            className="w-full justify-center"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Verify Settlement Status
          </Button>
        </form>
      </Card>

      {/* Result Display */}
      {result && (
        <Card title="Verification Result">
          <div className={`p-6 rounded-2xl border ${
            result.isVerified 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
              : 'bg-red-50 border-red-200 text-red-950'
          }`}>
            <div className="flex items-center gap-3">
              {result.isVerified ? (
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center">
                  <XCircle className="w-7 h-7" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold font-display">
                  {result.isVerified ? 'Settlement Confirmed — Safe to Release' : 'Payment NOT Verified — Hold Goods'}
                </h3>
                <p className="text-xs opacity-80 mt-0.5">
                  Reference: <span className="font-mono font-semibold">{reference}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 text-xs bg-white/60 p-4 rounded-xl">
              <div>
                <span className="text-slate-500 block">Verification Status:</span>
                <span className="font-bold">{result.status}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Settled Amount:</span>
                <span className="font-bold">{result.settledAmount ? formatNaira(result.settledAmount) : '₦0.00'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Match Confidence:</span>
                <span className="font-bold">{((result.confidenceScore || 0.98) * 100).toFixed(0)}%</span>
              </div>
            </div>

            {result.verificationNotes && (
              <div className="mt-4 text-xs font-medium">
                Note: {result.verificationNotes}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
