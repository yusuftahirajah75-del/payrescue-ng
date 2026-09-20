import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  CreditCard, 
  CheckCircle2, 
  Zap, 
  ExternalLink, 
  ShieldCheck, 
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { billingApi } from '../../api/billing.api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { formatNaira } from '../../utils/formatters';

export const BusinessBillingPage: React.FC = () => {
  const { activeBusiness } = useAuth();
  const { addToast } = useToast();

  const businessId = activeBusiness?.id || 'default';

  const { data: plans = [], isLoading: isPlansLoading } = useQuery({
    queryKey: ['billing-plans'],
    queryFn: () => billingApi.getPlans(),
  });

  const { data: subscription, isLoading: isSubLoading } = useQuery({
    queryKey: ['billing-subscription', businessId],
    queryFn: () => billingApi.getSubscription(businessId),
  });

  const subscribeMutation = useMutation({
    mutationFn: (planCode: string) => 
      billingApi.subscribe(businessId, { 
        planCode,
        callbackUrl: window.location.href,
      }),
    onSuccess: (data) => {
      if (data?.authorizationUrl) {
        addToast('info', 'Redirecting to Paystack secure checkout...');
        window.location.href = data.authorizationUrl;
      } else {
        addToast('success', 'Plan upgrade requested successfully');
      }
    },
    onError: (err: any) => {
      addToast('error', err.response?.data?.message || 'Subscription request failed');
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900">
          Subscription & Settlement Quotas
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Scale your multi-bank reconciliation volume and unlock automated regulatory dispute dispatch.
        </p>
      </div>

      {/* Current Plan Card */}
      <Card title="Current Subscription Status">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">
                {subscription?.plan?.name || 'Growth Merchant Tier'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs">
                {subscription?.status || 'ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Billed monthly &bull; Unlimited automated dispute filings &bull; Sub-second webhook delivery
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold font-display text-slate-900">
              {formatNaira(subscription?.plan?.priceNgn || 25000)}
            </span>
            <span className="text-xs text-slate-400"> / month</span>
          </div>
        </div>
      </Card>

      {/* Plans Pricing Grid */}
      <div>
        <h3 className="text-base font-bold font-display text-slate-900 mb-4">
          Available Subscription Plans
        </h3>

        {isPlansLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LoadingSkeleton className="h-64 rounded-2xl" />
            <LoadingSkeleton className="h-64 rounded-2xl" />
            <LoadingSkeleton className="h-64 rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isPopular = plan.code === 'GROWTH' || plan.code === 'PRO';
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-6 bg-white border flex flex-col justify-between transition-all ${
                    isPopular
                      ? 'border-brand-600 shadow-lg ring-2 ring-brand-500/20 relative'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-600 text-white text-[11px] font-bold tracking-wider uppercase">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <h4 className="text-base font-bold text-slate-900">{plan.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{plan.description}</p>

                    <div className="mt-4 mb-6">
                      <span className="text-3xl font-bold font-display text-slate-900">
                        {formatNaira(plan.priceNgn ?? plan.monthlyPriceNgn ?? 0)}
                      </span>
                      <span className="text-xs text-slate-400"> / month</span>
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                        Up to {plan.reconciliationQuotaLimit?.toLocaleString() || '10,000'} reconciliations/mo
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                        Anti-fraud payment verification API
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                        CBN / NCC dispute filing package
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                        Priority webhook dispatch
                      </li>
                    </ul>
                  </div>

                  <div className="mt-8 pt-4 border-t border-slate-100">
                    <Button
                      variant={isPopular ? 'primary' : 'outline'}
                      size="md"
                      className="w-full justify-center"
                      loading={subscribeMutation.isPending}
                      onClick={() => subscribeMutation.mutate(plan.code)}
                    >
                      <Zap className="w-4 h-4 mr-1.5" />
                      Select {plan.name}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
