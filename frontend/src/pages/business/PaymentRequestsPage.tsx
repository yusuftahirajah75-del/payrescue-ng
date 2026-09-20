import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  CreditCard, 
  PlusCircle, 
  Copy, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Share2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { verificationApi } from '../../api/verification.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { formatNaira, formatDate } from '../../utils/formatters';
import { PaymentRequest } from '../../types';

export const PaymentRequestsPage: React.FC = () => {
  const { activeBusiness } = useAuth();
  const { addToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [payerIdentifier, setPayerIdentifier] = useState('');
  const [expiresInMinutes, setExpiresInMinutes] = useState(60);

  const [createdRequests, setCreatedRequests] = useState<PaymentRequest[]>([]);

  const businessId = activeBusiness?.id || 'default';

  const createMutation = useMutation({
    mutationFn: (data: any) => verificationApi.createPaymentRequest(businessId, data),
    onSuccess: (newReq) => {
      addToast('success', 'Payment request generated with tracked reference');
      setCreatedRequests((prev) => [newReq, ...prev]);
      setIsModalOpen(false);
      setAmount('');
      setDescription('');
      setPayerIdentifier('');
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to create payment request');
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) {
      addToast('warning', 'Please specify expected amount');
      return;
    }
    createMutation.mutate({
      expectedAmount: Number(amount),
      description,
      payerIdentifier: payerIdentifier || undefined,
      expiresInMinutes,
    });
  };

  const copyPaymentLink = (ref: string) => {
    const url = `${window.location.origin}/pay/${ref}`;
    navigator.clipboard.writeText(url);
    addToast('success', 'Payment request link copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            Payment Requests & Invoices
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate uniquely tracked bank transfer requests to tie customer payments directly to invoices.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-1.5" />
          Create Payment Request
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-brand-500">
          <div className="text-xs text-slate-500 font-medium">Auto-Reconciled Transfer Rate</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-display">100%</div>
          <p className="text-xs text-brand-600 mt-1">Direct session ID to invoice binding</p>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <div className="text-xs text-slate-500 font-medium">Active Payment Links</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-display">
            {createdRequests.length}
          </div>
          <p className="text-xs text-slate-500 mt-1">Ready to receive customer transfer</p>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <div className="text-xs text-slate-500 font-medium">Bank Virtual Routing</div>
          <div className="text-xl font-bold text-slate-900 mt-1 font-display">Active (NIP/NIBSS)</div>
          <p className="text-xs text-emerald-600 mt-1">Sub-second webhook notification</p>
        </Card>
      </div>

      {/* Requests Table */}
      <Card title="Payment Requests">
        {createdRequests.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            No payment requests created yet. Click "Create Payment Request" to generate an invoice.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-6">Reference</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Expected Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Expires At</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {createdRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-medium text-slate-900">
                      {req.paymentReference}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {req.description || 'Merchant Invoice'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatNaira(req.expectedAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px]">
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDate(req.expiresAt)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => copyPaymentLink(req.paymentReference || req.requestReference || '')}
                      >
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        Copy Link
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Tracked Payment Request"
        subtitle="Generates a unique reference for the customer to use as transfer narration."
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <Input
            label="Expected Amount (NGN)"
            type="number"
            placeholder="e.g. 50000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Input
            label="Invoice / Service Description"
            placeholder="e.g. Invoice #2024-082 - Web Hosting"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Input
            label="Customer Name or Email"
            placeholder="e.g. customer@example.com"
            value={payerIdentifier}
            onChange={(e) => setPayerIdentifier(e.target.value)}
          />

          <Input
            label="Expires In (Minutes)"
            type="number"
            value={expiresInMinutes}
            onChange={(e) => setExpiresInMinutes(Number(e.target.value))}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={createMutation.isPending}>
              Generate Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
