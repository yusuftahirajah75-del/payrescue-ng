import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Lock, CheckCircle2 } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold font-display text-white">PAYRESCUE NG</span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed text-xs">
              Nigeria’s independent transaction recovery, cryptographic evidence vault, payment reconciliation, and dispute resolution infrastructure. One transaction → one rescue case.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit SHA Integrity</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> CBN Circular Aligned</span>
            </div>
          </div>

          {/* Column: Consumer */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">Consumer Rescue</h4>
            <ul className="space-y-2">
              <li><Link to="/where-is-my-money" className="hover:text-white transition-colors">Where Is My Money?</Link></li>
              <li><Link to="/where-is-my-money" className="hover:text-white transition-colors">Failed Bank Transfers</Link></li>
              <li><Link to="/where-is-my-money" className="hover:text-white transition-colors">DisCo Electricity Tokens</Link></li>
              <li><Link to="/where-is-my-money" className="hover:text-white transition-colors">Uncredited Airtime & Data</Link></li>
              <li><Link to="/cases" className="hover:text-white transition-colors">Track Rescue Case</Link></li>
            </ul>
          </div>

          {/* Column: Business & API */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">Merchant Infrastructure</h4>
            <ul className="space-y-2">
              <li><Link to="/business/reconciliation" className="hover:text-white transition-colors">Payment Reconciliation</Link></li>
              <li><Link to="/business/verify" className="hover:text-white transition-colors">Anti-Fraud Transfer Verification</Link></li>
              <li><Link to="/business/developer" className="hover:text-white transition-colors">TrustPay Developer API</Link></li>
              <li><a href="http://localhost:5000/api/docs" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">OpenAPI Documentation</a></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Merchant Pricing Plans</Link></li>
            </ul>
          </div>

          {/* Column: Legal & Status */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white uppercase tracking-wider text-[11px]">Regulatory & Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy (NDPR)</Link></li>
              <li><Link to="/status" className="hover:text-white transition-colors">Platform Status</Link></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclaimer */}
        <div className="pt-8 text-[11px] text-slate-500 space-y-3">
          <p>
            <strong>Regulatory Disclaimer:</strong> PayRescue NG is an independent technology infrastructure provider for financial dispute evidence compilation, statutory SLA tracking, and multi-tenant payment reconciliation. PayRescue is not a commercial bank, licensed payment terminal service provider (PTSP), or consumer refund authority. Funds remain solely under the custody of licensed financial institutions; PayRescue assists users in formatting standardized regulatory complaints pursuant to Central Bank of Nigeria (CBN) and FCCPC consumer dispute resolution frameworks.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-900">
            <span>&copy; {new Date().getFullYear()} PayRescue NG Infrastructure Technologies. All rights reserved.</span>
            <span>Operating in Africa/Lagos (NGN)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
