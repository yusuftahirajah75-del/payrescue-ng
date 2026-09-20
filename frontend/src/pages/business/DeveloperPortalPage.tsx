import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Key, 
  Webhook as WebhookIcon, 
  PlusCircle, 
  Copy, 
  Trash2, 
  CheckCircle2, 
  Send, 
  Code2, 
  AlertTriangle,
  Clock,
  Terminal,
  FileCode
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { developerApi } from '../../api/developer.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import { ApiKey, Webhook } from '../../types';

export const DeveloperPortalPage: React.FC = () => {
  const { activeBusiness } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'keys' | 'webhooks' | 'docs'>('keys');

  // Key Creation Modal
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyEnv, setKeyEnv] = useState<'live' | 'test'>('live');
  const [newlyCreatedRawKey, setNewlyCreatedRawKey] = useState<string | null>(null);

  // Webhook Modal
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['dispute.created', 'payment.verified']);

  const businessId = activeBusiness?.id || 'default';

  // Fetch Keys
  const { data: keys = [], isLoading: isKeysLoading } = useQuery({
    queryKey: ['developer-keys', businessId],
    queryFn: () => developerApi.listKeys(businessId),
  });

  // Fetch Webhooks
  const { data: webhooks = [], isLoading: isWebhooksLoading } = useQuery({
    queryKey: ['developer-webhooks', businessId],
    queryFn: () => developerApi.listWebhooks(businessId),
  });

  // Create Key Mutation
  const createKeyMutation = useMutation({
    mutationFn: (data: any) => developerApi.createKey(businessId, data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['developer-keys', businessId] });
      setNewlyCreatedRawKey(data.secretKey || data.key || 'pr_live_secret_key_generated');
      addToast('success', 'API Key created! Save it immediately.');
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to generate key');
    }
  });

  // Revoke Key Mutation
  const revokeKeyMutation = useMutation({
    mutationFn: (keyId: string) => developerApi.revokeKey(businessId, keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer-keys', businessId] });
      addToast('info', 'API Key revoked');
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to revoke key');
    }
  });

  // Create Webhook Mutation
  const createWebhookMutation = useMutation({
    mutationFn: (data: any) => developerApi.createWebhook(businessId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['developer-webhooks', businessId] });
      setIsWebhookModalOpen(false);
      setWebhookUrl('');
      addToast('success', 'Webhook endpoint registered');
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Failed to register webhook');
    }
  });

  // Test Webhook Mutation
  const testWebhookMutation = useMutation({
    mutationFn: (webhookId: string) => developerApi.testWebhook(businessId, webhookId),
    onSuccess: () => {
      addToast('success', 'Test ping event dispatched to your webhook URL');
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Test dispatch failed');
    }
  });

  const copyToClipboard = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    addToast('success', msg);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900">
            TrustPay Developer Platform
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Programmatic APIs for multi-bank reconciliation, payment verification, and automated dispute notifications.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'keys' && (
            <Button variant="primary" size="sm" onClick={() => setIsKeyModalOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Generate API Key
            </Button>
          )}
          {activeTab === 'webhooks' && (
            <Button variant="primary" size="sm" onClick={() => setIsWebhookModalOpen(true)}>
              <PlusCircle className="w-4 h-4 mr-1.5" />
              Register Webhook
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('keys')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'keys'
                ? 'border-brand-600 text-brand-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Key className="w-4 h-4" />
            API Keys ({keys.length})
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'webhooks'
                ? 'border-brand-600 text-brand-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <WebhookIcon className="w-4 h-4" />
            Webhooks ({webhooks.length})
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'docs'
                ? 'border-brand-600 text-brand-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Code Integration & SDK
          </button>
        </nav>
      </div>

      {/* Tab: API Keys */}
      {activeTab === 'keys' && (
        <Card title="Your TrustPay API Keys">
          {keys.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No API keys generated yet. Click "Generate API Key" to begin integrating.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase font-semibold">
                    <th className="py-3 px-6">Name</th>
                    <th className="py-3 px-4">Environment</th>
                    <th className="py-3 px-4">Key Prefix</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {keys.map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-slate-900">
                        {k.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          k.environment === 'live'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {k.environment.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {k.prefix || 'pr_live_...'}••••••••
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(k.createdAt)}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => revokeKeyMutation.mutate(k.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Revoke
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab: Webhooks */}
      {activeTab === 'webhooks' && (
        <Card title="Registered Webhook Endpoints">
          {webhooks.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No webhook endpoints configured. Add an endpoint to receive automated real-time alerts.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 uppercase font-semibold">
                    <th className="py-3 px-6">Endpoint URL</th>
                    <th className="py-3 px-4">Subscribed Events</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-6 text-right">Test Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {webhooks.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-medium text-slate-900 truncate max-w-xs">
                        {w.targetUrl}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {w.subscribedEvents?.join(', ') || 'dispute.created, payment.verified'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                          Active
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2.5"
                          loading={testWebhookMutation.isPending}
                          onClick={() => testWebhookMutation.mutate(w.id)}
                        >
                          <Send className="w-3 h-3 mr-1" /> Test Ping
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab: Code Integration */}
      {activeTab === 'docs' && (
        <div className="space-y-6">
          <Card title="cURL Quickstart: Verify Customer Transfer">
            <div className="relative bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <button 
                onClick={() => copyToClipboard(`curl -X POST https://api.payrescue.ng/api/v1/verification/${businessId}/verify \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "claimedReference": "10000424092014022839485",\n    "claimedAmount": 25000\n  }'`, 'cURL command copied')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white p-1 rounded bg-slate-800"
              >
                <Copy className="w-4 h-4" />
              </button>
              <pre>{`curl -X POST https://api.payrescue.ng/api/v1/verification/${businessId}/verify \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "claimedReference": "10000424092014022839485",
    "claimedAmount": 25000
  }'`}</pre>
            </div>
          </Card>

          <Card title="Node.js / TypeScript Example">
            <div className="relative bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <button 
                onClick={() => copyToClipboard(`import axios from 'axios';\n\nconst response = await axios.post(\n  'https://api.payrescue.ng/api/v1/verification/${businessId}/verify',\n  { claimedReference: '10000424092014022839485', claimedAmount: 25000 },\n  { headers: { Authorization: 'Bearer YOUR_API_KEY' } }\n);\n\nif (response.data.data.isVerified) {\n  console.log('Payment Authoritatively Settled! Deliver value.');\n}`, 'Node.js code copied')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white p-1 rounded bg-slate-800"
              >
                <Copy className="w-4 h-4" />
              </button>
              <pre>{`import axios from 'axios';

const response = await axios.post(
  'https://api.payrescue.ng/api/v1/verification/${businessId}/verify',
  { claimedReference: '10000424092014022839485', claimedAmount: 25000 },
  { headers: { Authorization: 'Bearer YOUR_API_KEY' } }
);

if (response.data.data.isVerified) {
  console.log('Payment Authoritatively Settled! Deliver value.');
}`}</pre>
            </div>
          </Card>
        </div>
      )}

      {/* Modal: Create Key */}
      <Modal
        isOpen={isKeyModalOpen}
        onClose={() => {
          setIsKeyModalOpen(false);
          setNewlyCreatedRawKey(null);
        }}
        title="Generate New API Key"
        subtitle="Authenticate server-to-server requests using Bearer tokens."
      >
        {newlyCreatedRawKey ? (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg">
              <div className="font-bold flex items-center gap-1 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Store this key securely!
              </div>
              For security reasons, this key will never be shown again.
            </div>

            <div className="p-3 bg-slate-100 rounded-lg font-mono text-slate-900 break-all flex items-center justify-between">
              <span>{newlyCreatedRawKey}</span>
              <button 
                onClick={() => copyToClipboard(newlyCreatedRawKey, 'Key copied to clipboard')}
                className="text-brand-600 hover:text-brand-800 p-1"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => {
                  setIsKeyModalOpen(false);
                  setNewlyCreatedRawKey(null);
                }}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!keyName) return;
              createKeyMutation.mutate({ name: keyName, environment: keyEnv, scopes: ['*'] });
            }} 
            className="space-y-4 text-xs"
          >
            <Input
              label="Key Identifier / Name"
              placeholder="e.g. Production Backend Worker"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              required
            />

            <Select
              label="Environment"
              value={keyEnv}
              onChange={(e) => setKeyEnv(e.target.value as any)}
              options={[
                { value: 'live', label: 'Live Production' },
                { value: 'test', label: 'Sandbox / Test' },
              ]}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsKeyModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" loading={createKeyMutation.isPending}>
                Create Key
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal: Create Webhook */}
      <Modal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        title="Register Webhook Endpoint"
        subtitle="PayRescue will dispatch HTTPS POST events with HMAC signatures to this URL."
      >
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (!webhookUrl) return;
            createWebhookMutation.mutate({ targetUrl: webhookUrl, subscribedEvents: selectedEvents });
          }} 
          className="space-y-4 text-xs"
        >
          <Input
            label="Destination HTTPS URL"
            placeholder="https://api.yourdomain.com/webhooks/payrescue"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            required
          />

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Subscribed Event Types
            </label>
            <div className="space-y-1.5">
              {['dispute.created', 'payment.verified', 'settlement.matched', 'case.escalated'].map((evt) => (
                <label key={evt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(evt)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedEvents([...selectedEvents, evt]);
                      else setSelectedEvents(selectedEvents.filter((item) => item !== evt));
                    }}
                    className="rounded text-brand-600"
                  />
                  <span className="font-mono text-slate-800">{evt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsWebhookModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={createWebhookMutation.isPending}>
              Register Endpoint
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
