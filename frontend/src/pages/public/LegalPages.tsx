import React from 'react';
import { Card } from '../../components/common/Card';
import { ShieldAlert } from 'lucide-react';

export const LegalTermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-brand-600" />
          Terms of Service & Regulatory Basis
        </h1>
        <p className="text-xs text-slate-500 mt-1">Last Updated: September 2026 • PayRescue NG Technologies</p>
      </div>

      <Card className="p-8 prose prose-slate max-w-none text-xs leading-relaxed space-y-6">
        <section>
          <h3 className="text-sm font-bold text-slate-900 font-display">1. Nature of the Service</h3>
          <p>
            PayRescue NG operates strictly as an independent financial dispute evidence compilation, statutory timeline tracking, and merchant reconciliation infrastructure. PayRescue is <strong>not a commercial bank, financial institution, licensed payment processor, or statutory tribunal</strong>.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-900 font-display">2. No Guarantee of Direct Refund</h3>
          <p>
            PayRescue does not possess legal or technical custody over customer funds. All disputed sums remain with the originating or recipient licensed deposit money bank (DMB) or payment switch. PayRescue generates standardized formal regulatory complaint dossiers and monitors statutory response deadlines under the <em>Central Bank of Nigeria (CBN) Consumer Protection Framework</em>.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-900 font-display">3. Evidence Integrity & Prohibition of Fraudulent Claims</h3>
          <p>
            Users warrant that all uploaded transaction receipts, SMS alerts, and account statements are genuine and unmanipulated. PayRescue calculates cryptographic SHA-256 digests for all files. Uploading altered or fabricated financial receipts constitutes a felony under the <em>Cybercrimes (Prohibition, Prevention, Etc.) Act</em> and will result in immediate permanent account termination and referral to financial crime enforcement authorities.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-900 font-display">4. Multi-Tenant Merchant Reconciliation</h3>
          <p>
            Merchants utilizing the payment reconciliation platform acknowledge that PayRescue performs algorithmic matching based on provided bank settlement feeds. While matching algorithms apply fuzzy reference and amount correlation, merchants retain final responsibility for product fulfillment.
          </p>
        </section>
      </Card>
    </div>
  );
};

export const LegalPrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-brand-600" />
          Privacy Policy & NDPR Compliance
        </h1>
        <p className="text-xs text-slate-500 mt-1">Nigeria Data Protection Regulation (NDPR) Compliant</p>
      </div>

      <Card className="p-8 prose prose-slate max-w-none text-xs leading-relaxed space-y-6">
        <section>
          <h3 className="text-sm font-bold text-slate-900 font-display">1. Data Minimization & PII Protection</h3>
          <p>
            PayRescue collects only the data strictly necessary to investigate and process transaction disputes, including customer full name, contact phone, email address, transaction reference, and uploaded evidence files.
          </p>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-900 font-display">2. Cryptographic Evidence Security</h3>
          <p>
            All evidence documents (receipts, statements, screenshots) uploaded to PayRescue are hashed using SHA-256 digests to establish an immutable audit trail and stored in private storage with encrypted transport (TLS 1.3).
          </p>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-900 font-display">3. Retention & Deletion</h3>
          <p>
            Financial dispute records and statutory complaint logs are retained in accordance with CBN record-keeping mandates. Users may request account deactivation subject to statutory retention obligations.
          </p>
        </section>
      </Card>
    </div>
  );
};
