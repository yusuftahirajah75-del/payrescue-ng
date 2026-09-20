import { ProviderCategory } from '@prisma/client';

export interface ProviderEscalationRoute {
  level: number;
  target: string;
  channel: 'EMAIL' | 'PORTAL' | 'REGULATOR_PORTAL';
  contact: string;
  guidelinesRef: string;
}

export interface ProviderAdapter {
  category: ProviderCategory;
  validateReference(reference: string): { isValid: boolean; message?: string };
  getRequiredEvidence(): string[];
  getDefaultSlaHours(): number;
  getEscalationRoutes(): ProviderEscalationRoute[];
  formatComplaint(payload: {
    caseNumber: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    transactionReference: string;
    amount: string;
    timestamp: string;
    providerName: string;
    category: string;
    evidenceList: string[];
  }): { subject: string; body: string; statutoryBasis: string };
}

export class BankProviderAdapter implements ProviderAdapter {
  category = ProviderCategory.BANK;

  validateReference(reference: string) {
    const trimmed = reference.trim();
    // NIP Session ID is 30 digits, RRN is 12 digits
    if (trimmed.length === 30 && /^\d+$/.test(trimmed)) {
      return { isValid: true };
    }
    if (trimmed.length >= 10 && trimmed.length <= 16) {
      return { isValid: true };
    }
    return {
      isValid: false,
      message: 'Bank reference should be a 30-digit NIBSS Session ID or 12-digit RRN.',
    };
  }

  getRequiredEvidence() {
    return ['DEBIT_ALERT', 'SESSION_ID', 'ACCOUNT_STATEMENT_EXCERPT'];
  }

  getDefaultSlaHours() {
    return 72; // Standard CBN Consumer Protection circular (72 hours for interbank electronic transfers)
  }

  getEscalationRoutes(): ProviderEscalationRoute[] {
    return [
      {
        level: 0,
        target: 'Bank Internal Dispute Desk',
        channel: 'EMAIL',
        contact: 'disputes@bank.ng',
        guidelinesRef: 'Internal Bank Dispute Procedure',
      },
      {
        level: 1,
        target: 'Central Bank of Nigeria (CBN) Consumer Protection Department',
        channel: 'EMAIL',
        contact: 'cpd@cbn.gov.ng',
        guidelinesRef: 'CBN Circular FPR/DIR/GEN/CIR/01/020 (Consumer Protection Framework)',
      },
      {
        level: 2,
        target: 'Federal Competition & Consumer Protection Commission (FCCPC)',
        channel: 'PORTAL',
        contact: 'https://fccpc.gov.ng/consumer-protection/complaints/',
        guidelinesRef: 'FCCPA 2018 Section 130',
      },
    ];
  }

  formatComplaint(payload: {
    caseNumber: string;
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    transactionReference: string;
    amount: string;
    timestamp: string;
    providerName: string;
    evidenceList: string[];
  }) {
    const statutoryBasis =
      'Central Bank of Nigeria (CBN) Circular on Standards for Direct Debit and NIP Electronic Funds Transfer Dispute Resolution.';
    const subject = `URGENT DISPUTE [${payload.caseNumber}]: Debited Uncredited NIP Transfer (${payload.amount}) - ${payload.customerName}`;
    const body = `To the Customer Dispute Operations Team, ${payload.providerName},

RE: NOTICE OF UNRESOLVED ELECTRONIC TRANSACTION DISPUTE
CASE TRACKING NO: ${payload.caseNumber}

This is a formal dispute notification submitted via PayRescue Infrastructure on behalf of the customer detailed below:

1. CUSTOMER PARTICULARS:
   - Full Name: ${payload.customerName}
   - Contact Phone: ${payload.customerPhone || 'Not provided'}
   - Registered Email: ${payload.customerEmail || 'Not provided'}

2. TRANSACTION AUDIT DETAILS:
   - Claimed Amount: ${payload.amount}
   - Transaction Date/Timestamp: ${payload.timestamp}
   - Reference / NIP Session ID / RRN: ${payload.transactionReference}
   - Disputed Channel: Electronic Interbank Transfer

3. FACTUAL SUMMARY:
   The customer accounts demonstrate an unequivocal debit of ${payload.amount} on ${payload.timestamp} without corresponding credit to the beneficiary destination or value delivery. The statutory 72-hour reversal window has elapsed without automated rollback.

4. SUBMITTED EVIDENCE DOSSIER:
   ${payload.evidenceList.map((e, idx) => `   [${idx + 1}] ${e}`).join('\n')}

5. REQUESTED RESOLUTION:
   In line with regulatory mandates, please investigate the NIBSS status code for Session ID ${payload.transactionReference} and initiate either:
   (a) Immediate recall / reversal to originating account, OR
   (b) Transmission of official NIBSS Successful Credit Delivery Confirmation (TSQ).

Statutory Basis: ${statutoryBasis}

Yours faithfully,
PayRescue Dispute & Transaction Recovery Engine
Case ID: ${payload.caseNumber}`;

    return { subject, body, statutoryBasis };
  }
}

export class TelecomProviderAdapter implements ProviderAdapter {
  category = ProviderCategory.TELECOM;

  validateReference(reference: string) {
    return { isValid: reference.trim().length >= 4 };
  }

  getRequiredEvidence() {
    return ['PAYMENT_DEBIT_ALERT', 'SMS_OR_RECEIPT', 'BENEFICIARY_PHONE_NUMBER'];
  }

  getDefaultSlaHours() {
    return 24; // NCC Quality of Service / Billing dispute SLA
  }

  getEscalationRoutes(): ProviderEscalationRoute[] {
    return [
      {
        level: 0,
        target: 'Telecom Service Support Desk',
        channel: 'EMAIL',
        contact: 'customercare@network.ng',
        guidelinesRef: 'NCC Consumer Code of Practice Regulations',
      },
      {
        level: 1,
        target: 'Nigerian Communications Commission (NCC) Consumer Affairs Bureau',
        channel: 'EMAIL',
        contact: 'consumer@ncc.gov.ng',
        guidelinesRef: 'NCC Toll-Free 622 Dispute Escalation Procedure',
      },
    ];
  }

  formatComplaint(payload: any) {
    const statutoryBasis =
      'Nigerian Communications Commission (NCC) General Consumer Code of Practice.';
    const subject = `URGENT [${payload.caseNumber}]: Failed Airtime/Data Delivery - ${payload.amount} - ${payload.customerName}`;
    const body = `To: ${payload.providerName} Customer Care,

CASE NUMBER: ${payload.caseNumber}
The customer ${payload.customerName} was charged ${payload.amount} for telecom services that were not credited to the recipient number.
Reference: ${payload.transactionReference}
Timestamp: ${payload.timestamp}

Attached Evidence:
${payload.evidenceList.join('\n')}

Immediate value delivery or refund requested under NCC Consumer Protection guidelines.`;
    return { subject, body, statutoryBasis };
  }
}

export class ElectricityProviderAdapter implements ProviderAdapter {
  category = ProviderCategory.ELECTRICITY;

  validateReference(reference: string) {
    return { isValid: reference.trim().length >= 6 };
  }

  getRequiredEvidence() {
    return ['DEBIT_RECEIPT', 'METER_NUMBER', 'AGGREGATOR_TRANSACTION_ID'];
  }

  getDefaultSlaHours() {
    return 24;
  }

  getEscalationRoutes(): ProviderEscalationRoute[] {
    return [
      {
        level: 0,
        target: 'DisCo Customer Support',
        channel: 'EMAIL',
        contact: 'customercare@disco.ng',
        guidelinesRef: 'NERC Customer Complaints Handling: Standards and Procedures',
      },
      {
        level: 1,
        target: 'Nigerian Electricity Regulatory Commission (NERC) Forum Office',
        channel: 'EMAIL',
        contact: 'forum@nerc.gov.ng',
        guidelinesRef: 'NERC Forum Office Appeal Regulations',
      },
    ];
  }

  formatComplaint(payload: any) {
    const statutoryBasis =
      'Nigerian Electricity Regulatory Commission (NERC) Customer Service Standards.';
    const subject = `URGENT [${payload.caseNumber}]: Token Not Generated After Payment (${payload.amount}) - ${payload.customerName}`;
    const body = `To: ${payload.providerName} Billing Operations,

CASE NUMBER: ${payload.caseNumber}
Payment of ${payload.amount} was confirmed debited on ${payload.timestamp} with reference ${payload.transactionReference}, but no 20-digit prepaid electricity token was generated.

Please generate and dispatch token or reverse payment.`;
    return { subject, body, statutoryBasis };
  }
}

export class ProviderAdapterRegistry {
  private static adapters: Map<ProviderCategory, ProviderAdapter> = new Map<ProviderCategory, ProviderAdapter>([
    [ProviderCategory.BANK, new BankProviderAdapter() as ProviderAdapter],
    [ProviderCategory.TELECOM, new TelecomProviderAdapter() as ProviderAdapter],
    [ProviderCategory.ELECTRICITY, new ElectricityProviderAdapter() as ProviderAdapter],
  ]);

  static getAdapter(category: ProviderCategory): ProviderAdapter {
    return this.adapters.get(category) || new BankProviderAdapter();
  }
}
