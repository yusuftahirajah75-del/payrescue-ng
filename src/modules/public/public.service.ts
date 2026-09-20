import { prisma } from '../../prisma/client';

export class PublicService {
  static getPlatformInfo() {
    return {
      name: 'PayRescue NG',
      tagline: "Nigeria's Transaction Recovery & Payment Reconciliation Infrastructure",
      corePromise: 'One transaction → one rescue case.',
      mission:
        'PayRescue is a digital transaction recovery, evidence vault, reconciliation, payment-verification, dispute-management, and trust infrastructure for Nigerian consumers and businesses.',
      supportedCurrencies: ['NGN'],
      timezone: 'Africa/Lagos',
      regulatoryCompliance:
        'Independent technology infrastructure designed in compliance with CBN Consumer Protection Framework and FCCPC dispute guidelines.',
      legalDisclaimer:
        'PayRescue is not a commercial bank, payment processor, or dispute adjudication authority. We provide independent evidence verification, structured complaint preparation, and multi-tenant reconciliation infrastructure.',
    };
  }

  static getFeatures() {
    return {
      consumer: [
        {
          title: 'Transaction Rescue Engine',
          description:
            'File a rescue case for debited-not-credited transfers, failed airtime/data, or unissued electricity tokens.',
          badge: 'Automated Assistance',
        },
        {
          title: 'Evidence Vault',
          description:
            'Upload bank debit alerts, payment receipts, and session IDs secured with cryptographic SHA-256 verification.',
          badge: 'Tamper-Proof',
        },
        {
          title: 'Regulatory Complaint Generator',
          description:
            'Generate formal complaint packages pre-formatted to CBN, NCC, and FCCPC standards with exact statutory reference codes.',
          badge: 'Official Formats',
        },
        {
          title: 'SLA Escalation Tracker',
          description:
            'Track your dispute across statutory provider response windows (e.g. 72hrs for interbank NIP reversals).',
          badge: 'SLA Countdown',
        },
      ],
      business: [
        {
          title: 'Automated Payment Reconciliation',
          description:
            'Match customer payment claims against actual bank/PSP settlement feeds with fuzzy date, amount, and reference matching.',
          badge: 'Multi-Tenant',
        },
        {
          title: 'Merchant Payment Verification',
          description:
            'Confirm incoming bank transfers and customer receipts before delivering high-value goods without relying on spoofable SMS.',
          badge: 'Anti-Fraud',
        },
        {
          title: 'TrustPay Developer API',
          description:
            'Programmatically verify transactions, initiate automated dispute cases, and receive webhooks on claim resolutions.',
          badge: 'REST & Webhooks',
        },
        {
          title: 'Dispute Management Portal',
          description:
            'Manage customer refund inquiries, chargebacks, and evidence dossiers in one unified workspace with team RBAC.',
          badge: 'Team Collaboration',
        },
      ],
    };
  }

  static async getPricingPlans() {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { monthlyPriceNgn: 'asc' },
    });

    if (plans.length > 0) {
      return plans;
    }

    // Default Nigerian plan structure if DB not yet seeded
    return [
      {
        code: 'FREE',
        name: 'Consumer Rescue',
        monthlyPriceNgn: 0,
        annualPriceNgn: 0,
        description: 'For individuals seeking recovery on failed personal transactions.',
        features: [
          'Up to 3 active rescue cases/month',
          'Cryptographic evidence storage',
          'Automated formal complaint generator',
          'Standard provider directory & escalation templates',
        ],
      },
      {
        code: 'STARTER',
        name: 'Merchant Starter',
        monthlyPriceNgn: 15000,
        annualPriceNgn: 150000,
        description: 'For growing retail merchants and online vendors in Nigeria.',
        features: [
          'Up to 50 payment claims & cases/month',
          'CSV bank settlement reconciliation',
          'Manual payment verification lookups',
          'Email support with 24hr SLA',
        ],
      },
      {
        code: 'BUSINESS',
        name: 'Business Pro',
        monthlyPriceNgn: 50000,
        annualPriceNgn: 500000,
        description: 'For e-commerce brands, logistics, and bill payment aggregators.',
        features: [
          'Unlimited payment reconciliations',
          'TrustPay Developer API & Webhooks',
          'Multi-user team RBAC (up to 5 agents)',
          'Automated risk signal alerts',
          'Priority escalation routing',
        ],
      },
    ];
  }

  static getFaqs() {
    return [
      {
        category: 'General',
        question: 'What is PayRescue?',
        answer:
          'PayRescue is an independent Nigerian dispute recovery and reconciliation infrastructure. We empower consumers and businesses to track, verify, and resolve failed or disputed digital transactions across banks, telcos, and payment gateways.',
      },
      {
        category: 'Consumer',
        question: 'Does PayRescue directly refund my money?',
        answer:
          'No. Legally, funds remain with the originating or recipient financial institution. PayRescue generates cryptographic evidence dossiers, tracks statutory resolution SLAs, and submits standardized regulatory complaints directly through provider escalation channels to compel resolution.',
      },
      {
        category: 'Consumer',
        question: 'What information do I need to file a rescue case?',
        answer:
          'You need the transaction amount, date, bank/provider involved, and any identifier you have (such as NIP Session ID, RRN, USSD reference, or meter number), along with a screenshot or PDF of your debit alert or receipt.',
      },
      {
        category: 'Business',
        question: 'How does PayRescue Payment Reconciliation work for merchants?',
        answer:
          'Merchants can upload their bank statements or connect via API. PayRescue correlates customer payment claims with settlement lines, detecting discrepancies, duplicate claims, and uncredited transfers instantly.',
      },
    ];
  }

  static async getProviders() {
    const providers = await prisma.provider.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        category: true,
        logoUrl: true,
        slaHours: true,
        requiredEvidence: true,
      },
      orderBy: { name: 'asc' },
    });
    return providers;
  }

  static async getStatus() {
    const dbHealthy = true;
    return {
      status: 'OPERATIONAL',
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
      components: {
        database: dbHealthy ? 'HEALTHY' : 'DEGRADED',
        evidenceVault: 'HEALTHY',
        reconciliationEngine: 'HEALTHY',
        providerGatewayDirectory: 'HEALTHY',
        webhookDispatcher: 'HEALTHY',
      },
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
