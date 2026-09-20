import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Lock,
  Search,
  Zap,
  Building2,
  FileCheck2,
  CreditCard,
  Scale,
  Send,
  HelpCircle,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';
import { publicApi } from '../../api/public.api';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import { formatNaira } from '../../utils/formatters';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // 1. Fetch live backend metadata
  const { data: platform } = useQuery({
    queryKey: ['public', 'platform'],
    queryFn: publicApi.getPlatformInfo,
  });

  const { data: features } = useQuery({
    queryKey: ['public', 'features'],
    queryFn: publicApi.getFeatures,
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['public', 'providers'],
    queryFn: publicApi.getProviders,
  });

  const { data: pricingPlans = [] } = useQuery({
    queryKey: ['public', 'pricing'],
    queryFn: publicApi.getPricing,
  });

  const { data: faqs = [] } = useQuery({
    queryKey: ['public', 'faq'],
    queryFn: publicApi.getFaq,
  });

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const contactMutation = useMutation({
    mutationFn: publicApi.contactSupport,
    onSuccess: (data) => {
      toast.success('Inquiry Dispatched', data.message);
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    },
    onError: (err: any) => {
      toast.error('Failed to Send', err.message);
    },
  });

  return (
    <div className="space-y-24 pb-20">
      {/* ----------------- 1. HERO SECTION ----------------- */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
        {/* Background Subtle Gradient Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-50/80 to-transparent pointer-events-none -z-10 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold shadow-sm animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nigeria’s Transaction Recovery & Payment Reconciliation Infrastructure</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Debited but value not delivered? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-800">
              One transaction → one rescue case.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            {platform?.mission ||
              'PayRescue is an independent technology infrastructure for Nigerian consumers and businesses to track, compile cryptographic evidence, and enforce dispute resolution across banks, telcos, and payment gateways.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              variant="brand"
              size="lg"
              onClick={() => navigate('/where-is-my-money')}
              icon={<Search className="w-5 h-5" />}
              className="w-full sm:w-auto shadow-xl shadow-brand-600/25"
            >
              Where Is My Money?
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/register')}
              icon={<Building2 className="w-5 h-5 text-slate-700" />}
              className="w-full sm:w-auto"
            >
              Merchant Reconciliation Portal
            </Button>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              NIBSS NIP Session ID Tracking
            </span>
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-600" />
              SHA-256 Tamper-Proof Evidence
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" />
              CBN 72hr Statutory SLA Countdown
            </span>
          </div>
        </div>
      </section>

      {/* ----------------- 2. HOW IT WORKS ----------------- */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <Badge variant="success">Simple 4-Step Recovery</Badge>
          <h2 className="text-3xl font-extrabold font-display text-slate-900">How PayRescue Recovers Your Funds</h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            From filing to resolution, every step generates cryptographic proof and official regulatory correspondence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: '01',
              title: 'File & Classify',
              desc: 'Select transaction issue: uncredited bank transfer, failed airtime, or missing prepaid meter token.',
              icon: <HelpCircle className="w-6 h-6 text-brand-600" />,
            },
            {
              step: '02',
              title: 'Upload Evidence',
              desc: 'Provide debit alert, session ID, or bank receipt. Our vault stamps files with SHA-256 digests.',
              icon: <FileCheck2 className="w-6 h-6 text-brand-600" />,
            },
            {
              step: '03',
              title: 'Generate Complaint',
              desc: 'Automated complaint engine prepares formal dispute package formatted to CBN and NCC guidelines.',
              icon: <Scale className="w-6 h-6 text-brand-600" />,
            },
            {
              step: '04',
              title: 'SLA Tracking & Reversal',
              desc: 'Live countdown tracks provider review. If breached, the case escalates automatically to regulator portals.',
              icon: <Zap className="w-6 h-6 text-brand-600" />,
            },
          ].map((item, idx) => (
            <Card key={idx} hover className="relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-2xl font-extrabold font-display text-slate-200">{item.step}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 font-display">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ----------------- 3. FEATURES (CONSUMER & BUSINESS) ----------------- */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="info">Infrastructure Features</Badge>
          <h2 className="text-3xl font-extrabold font-display text-slate-900">Tailored for Consumers & Businesses</h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            A comprehensive trust infrastructure solving Nigeria’s unique transaction failure bottlenecks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Consumer Features Card */}
          <div className="bg-gradient-to-br from-emerald-950 to-slate-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 text-emerald-300 text-xs font-semibold">
              For Everyday Consumers
            </div>
            <h3 className="text-2xl font-extrabold font-display">Never Lose Money to Failed Electronic Transfers</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              When banking apps show debit and the vendor sees no credit, PayRescue acts as your independent advocate with official statutory backing.
            </p>

            <div className="space-y-4 pt-4 border-t border-emerald-900/60">
              {features?.consumer?.map((f, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{f.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button
                variant="brand"
                size="md"
                onClick={() => navigate('/where-is-my-money')}
                icon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Start a Free Rescue Case
              </Button>
            </div>
          </div>

          {/* Business Features Card */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-lg space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
              For Nigerian Merchants & Enterprises
            </div>
            <h3 className="text-2xl font-extrabold font-display text-slate-900">
              Payment Reconciliation & Fraud Prevention
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Eliminate hours of manual bank statement review. Ingest settlement CSVs, match customer payment claims, and prevent fake alert chargeback fraud.
            </p>

            <div className="space-y-4 pt-4 border-t border-slate-100">
              {features?.business?.map((f, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <div className="w-5 h-5 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{f.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/register')}
                icon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                Register Business Account
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- 4. SUPPORTED PROVIDERS DIRECTORY ----------------- */}
      <section id="providers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <Badge variant="default">Supported Ecosystem</Badge>
          <h2 className="text-3xl font-extrabold font-display text-slate-900">Supported Banks, Telcos & Utilities</h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Pre-configured with statutory resolution timelines and escalation routing for Nigeria’s key financial institutions.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {providers.map((prov) => (
            <Card key={prov.id} hover className="p-4 flex flex-col justify-between text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center font-bold font-display text-slate-700 text-sm">
                {prov.code.slice(0, 3)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 truncate">{prov.name}</h4>
                <span className="text-[10px] text-slate-400 font-medium block mt-0.5 uppercase tracking-wider">
                  {prov.category.replace('_', ' ')}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                  SLA: {prov.slaHours}h Max
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ----------------- 5. PRICING PLANS ----------------- */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="warning">Transparent Pricing</Badge>
          <h2 className="text-3xl font-extrabold font-display text-slate-900">Simple, Predictable Plans</h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Free for individual consumers recovering personal money. Scalable subscriptions for retail vendors and e-commerce enterprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id || plan.code}
              className={`flex flex-col justify-between relative ${
                plan.code === 'BUSINESS'
                  ? 'border-brand-500 ring-2 ring-brand-500 shadow-xl'
                  : 'border-slate-200'
              }`}
            >
              {plan.code === 'BUSINESS' && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.description}</p>
                </div>

                <div className="py-4 border-y border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold font-display text-slate-900">
                      {formatNaira(plan.monthlyPriceNgn)}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/ month</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-slate-600">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 mt-auto">
                <Button
                  variant={plan.code === 'BUSINESS' ? 'brand' : 'outline'}
                  size="md"
                  onClick={() => navigate(plan.code === 'FREE' ? '/where-is-my-money' : '/register')}
                  className="w-full"
                >
                  {plan.code === 'FREE' ? 'Start Free' : 'Select Plan'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ----------------- 6. FREQUENTLY ASKED QUESTIONS ----------------- */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="default">Got Questions?</Badge>
          <h2 className="text-3xl font-extrabold font-display text-slate-900">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-500">
            Clear answers about PayRescue’s legal status, dispute handling, and payment reconciliation.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <Card key={idx} className="p-5">
              <h4 className="text-sm font-bold text-slate-900 font-display flex items-center justify-between">
                <span>{faq.question}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-100">
                  {faq.category}
                </span>
              </h4>
              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ----------------- 7. CONTACT / SUPPORT ----------------- */}
      <section id="contact" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-8 sm:p-10 border border-slate-200/80 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold font-display text-slate-900">Need Specialized Assistance?</h3>
            <p className="text-xs text-slate-500">
              Submit an inquiry to our dispute resolution officers. We respond within 24 business hours.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              contactMutation.mutate({
                name: contactName,
                email: contactEmail,
                subject: contactSubject,
                message: contactMessage,
              });
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="e.g. Chidi Okafor"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="chidi.okafor@example.ng"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
            </div>

            <Input
              label="Subject"
              placeholder="e.g. Inquiry regarding GTBank NIP transfer reversal"
              value={contactSubject}
              onChange={(e) => setContactSubject(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Message
              </label>
              <textarea
                rows={4}
                className="block w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Provide transaction details or inquiry..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="brand"
              size="md"
              isLoading={contactMutation.isPending}
              icon={<Send className="w-4 h-4" />}
              className="w-full"
            >
              Dispatch Inquiry
            </Button>
          </form>
        </Card>
      </section>
    </div>
  );
};
