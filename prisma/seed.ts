import { PrismaClient, Role, AccountStatus, ProviderCategory, TransactionType, TransactionStatus, CaseStatus, CasePriority, DisputeCategory, SubscriptionTier, RiskAction } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [PayRescue NG] Starting database seeding with realistic Nigerian data...');

  const passwordHash = await bcrypt.hash('PayRescue2026!', 10);

  // 1. Seed Core Administrative & Demo Users
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@payrescue.ng' },
    update: {},
    create: {
      email: 'superadmin@payrescue.ng',
      passwordHash,
      firstName: 'Tunde',
      lastName: 'Adeyemi',
      phone: '+2348030000001',
      role: Role.SUPER_ADMIN,
      status: AccountStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const supportAgent = await prisma.user.upsert({
    where: { email: 'support@payrescue.ng' },
    update: {},
    create: {
      email: 'support@payrescue.ng',
      passwordHash,
      firstName: 'Fatima',
      lastName: 'Bello',
      phone: '+2348030000002',
      role: Role.SUPPORT_AGENT,
      status: AccountStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const consumer = await prisma.user.upsert({
    where: { email: 'chidi.okafor@example.ng' },
    update: {},
    create: {
      email: 'chidi.okafor@example.ng',
      passwordHash,
      firstName: 'Chidi',
      lastName: 'Okafor',
      phone: '+2348031234567',
      role: Role.USER,
      status: AccountStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const merchantUser = await prisma.user.upsert({
    where: { email: 'amina.merchant@lagosretail.ng' },
    update: {},
    create: {
      email: 'amina.merchant@lagosretail.ng',
      passwordHash,
      firstName: 'Amina',
      lastName: 'Danjuma',
      phone: '+2348029876543',
      role: Role.BUSINESS_OWNER,
      status: AccountStatus.ACTIVE,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  console.log('✅ Users seeded: Super Admin, Support Agent, Consumer, Business Owner');

  // 2. Seed Demo Business & Membership
  const business = await prisma.business.upsert({
    where: { slug: 'lagos-retail-hub' },
    update: {},
    create: {
      name: 'Lagos Retail Hub Ltd',
      slug: 'lagos-retail-hub',
      registrationNumber: 'RC-1849204',
      taxIdentificationNo: '24910492-0001',
      contactEmail: 'amina.merchant@lagosretail.ng',
      contactPhone: '+2348029876543',
      websiteUrl: 'https://lagosretailhub.ng',
      kybStatus: 'APPROVED',
      currency: 'NGN',
      members: {
        create: {
          userId: merchantUser.id,
          role: Role.BUSINESS_OWNER,
          title: 'Managing Director',
        },
      },
    },
  });

  console.log('✅ Demo Business seeded: Lagos Retail Hub Ltd');

  // 3. Seed Nigerian Providers Directory
  const providersData = [
    {
      code: 'GTBANK',
      name: 'Guaranty Trust Bank (GTBank)',
      category: ProviderCategory.BANK,
      logoUrl: 'https://assets.payrescue.ng/providers/gtbank.png',
      website: 'https://www.gtbank.com',
      supportEmail: 'complaints@gtbank.com',
      supportPhone: '0700482666328',
      slaHours: 72,
      requiredEvidence: ['DEBIT_ALERT', 'SESSION_ID', 'STATEMENT_PAGE'],
      complaintTemplate: 'STANDARD_BANK_NIP_TRANSFER',
    },
    {
      code: 'ACCESS_BANK',
      name: 'Access Bank Nigeria',
      category: ProviderCategory.BANK,
      logoUrl: 'https://assets.payrescue.ng/providers/access.png',
      website: 'https://www.accessbankplc.com',
      supportEmail: 'contactcenter@accessbankplc.com',
      supportPhone: '07003000000',
      slaHours: 72,
      requiredEvidence: ['DEBIT_ALERT', 'NIP_SESSION_ID'],
      complaintTemplate: 'STANDARD_BANK_NIP_TRANSFER',
    },
    {
      code: 'ZENITH_BANK',
      name: 'Zenith Bank',
      category: ProviderCategory.BANK,
      logoUrl: 'https://assets.payrescue.ng/providers/zenith.png',
      website: 'https://www.zenithbank.com',
      supportEmail: 'zenithdirect@zenithbank.com',
      supportPhone: '012787000',
      slaHours: 72,
      requiredEvidence: ['DEBIT_ALERT', 'NIP_SESSION_ID'],
      complaintTemplate: 'STANDARD_BANK_NIP_TRANSFER',
    },
    {
      code: 'OPAY',
      name: 'OPay Digital Services',
      category: ProviderCategory.PSP,
      logoUrl: 'https://assets.payrescue.ng/providers/opay.png',
      website: 'https://www.opayweb.com',
      supportEmail: 'ng-support@opay-inc.com',
      supportPhone: '07008888329',
      slaHours: 24,
      requiredEvidence: ['TRANSACTION_RECEIPT', 'TRANSACTION_ID'],
      complaintTemplate: 'FINTECH_WALLET_DISPUTE',
    },
    {
      code: 'PALMPAY',
      name: 'PalmPay Limited',
      category: ProviderCategory.PSP,
      logoUrl: 'https://assets.payrescue.ng/providers/palmpay.png',
      website: 'https://www.palmpay.com',
      supportEmail: 'support@palmpay.com',
      supportPhone: '018886888',
      slaHours: 24,
      requiredEvidence: ['TRANSACTION_RECEIPT', 'ORDER_ID'],
      complaintTemplate: 'FINTECH_WALLET_DISPUTE',
    },
    {
      code: 'MTN_NG',
      name: 'MTN Nigeria',
      category: ProviderCategory.TELECOM,
      logoUrl: 'https://assets.payrescue.ng/providers/mtn.png',
      website: 'https://www.mtn.ng',
      supportEmail: 'customercare.ng@mtn.com',
      supportPhone: '180',
      slaHours: 24,
      requiredEvidence: ['DEBIT_ALERT', 'BENEFICIARY_PHONE'],
      complaintTemplate: 'TELECOM_VTU_FAILED',
    },
    {
      code: 'AIRTEL_NG',
      name: 'Airtel Nigeria',
      category: ProviderCategory.TELECOM,
      logoUrl: 'https://assets.payrescue.ng/providers/airtel.png',
      website: 'https://www.airtel.com.ng',
      supportEmail: 'customercare@ng.airtel.com',
      supportPhone: '111',
      slaHours: 24,
      requiredEvidence: ['DEBIT_ALERT', 'BENEFICIARY_PHONE'],
      complaintTemplate: 'TELECOM_VTU_FAILED',
    },
    {
      code: 'EKEDC',
      name: 'Eko Electricity Distribution Company (EKEDC)',
      category: ProviderCategory.ELECTRICITY,
      logoUrl: 'https://assets.payrescue.ng/providers/ekedc.png',
      website: 'https://ekedp.com',
      supportEmail: 'customercare@ekedp.com',
      supportPhone: '07080655555',
      slaHours: 24,
      requiredEvidence: ['PAYMENT_RECEIPT', 'METER_NUMBER'],
      complaintTemplate: 'DISCO_TOKEN_UNGENERATED',
    },
    {
      code: 'PAYSTACK',
      name: 'Paystack Payments Limited',
      category: ProviderCategory.PAYMENT_GATEWAY,
      logoUrl: 'https://assets.payrescue.ng/providers/paystack.png',
      website: 'https://paystack.com',
      supportEmail: 'support@paystack.com',
      slaHours: 48,
      requiredEvidence: ['TRANSACTION_REFERENCE', 'DEBIT_RECEIPT'],
      complaintTemplate: 'GATEWAY_PAYMENT_FAILED',
    },
  ];

  for (const prov of providersData) {
    await prisma.provider.upsert({
      where: { code: prov.code },
      update: {},
      create: prov,
    });
  }

  console.log(`✅ Providers seeded (${providersData.length} Nigerian Banks, PSPs, Telcos, DisCos)`);

  // 4. Seed Pricing Plans
  const plansData = [
    {
      code: 'FREE',
      name: 'Consumer Rescue',
      tier: SubscriptionTier.FREE,
      description: 'Zero cost recovery assistance for Nigerian consumers filing personal disputes.',
      monthlyPriceNgn: 0,
      annualPriceNgn: 0,
      maxCasesPerMonth: 3,
      hasApiAccess: false,
      hasBulkRecon: false,
      features: [
        'Up to 3 active rescue cases/month',
        'Cryptographic evidence vault',
        'Automated formal regulatory complaint generator',
        'Standard 72hr SLA escalation tracker',
      ],
    },
    {
      code: 'STARTER',
      name: 'Merchant Starter',
      tier: SubscriptionTier.STARTER,
      description: 'Ideal for retail vendors and boutique stores verifying customer transfers.',
      monthlyPriceNgn: 15000,
      annualPriceNgn: 150000,
      maxCasesPerMonth: 50,
      hasApiAccess: false,
      hasBulkRecon: true,
      features: [
        'Up to 50 disputes & claims/month',
        'CSV bank settlement reconciliation',
        'Merchant payment verification portal',
        'Audit exportable PDFs',
      ],
    },
    {
      code: 'BUSINESS',
      name: 'Business Pro',
      tier: SubscriptionTier.BUSINESS,
      description: 'Designed for fast-growing online brands, logistics, and bill aggregators.',
      monthlyPriceNgn: 50000,
      annualPriceNgn: 500000,
      maxCasesPerMonth: 500,
      hasApiAccess: true,
      hasBulkRecon: true,
      features: [
        'Up to 500 cases & claims/month',
        'TrustPay Developer REST API & Webhooks',
        'Multi-user team RBAC (up to 5 agents)',
        'Automated risk signal alerts',
        'Priority regulator escalation routing',
      ],
    },
  ];

  for (const p of plansData) {
    await prisma.plan.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }

  console.log('✅ Subscription Plans seeded (FREE, STARTER, BUSINESS)');

  // 5. Seed Risk Rules
  const riskRulesData = [
    {
      code: 'CROSS_USER_DUPLICATE_REFERENCE',
      name: 'Cross-User Duplicate Reference',
      description: 'Flags transactions where the same payment reference is claimed by multiple distinct users.',
      severity: 'HIGH',
      action: RiskAction.REVIEW,
    },
    {
      code: 'AMOUNT_DISCREPANCY_DETECTED',
      name: 'Receipt vs Ledger Amount Discrepancy',
      description: 'Flags claims where the claimed receipt amount deviates from settled bank credit amount.',
      severity: 'MEDIUM',
      action: RiskAction.VERIFY,
    },
    {
      code: 'FUTURE_TIMESTAMP_DETECTED',
      name: 'Future Transaction Timestamp',
      description: 'Critical warning when transaction timestamp is set in the future.',
      severity: 'CRITICAL',
      action: RiskAction.BLOCK,
    },
    {
      code: 'HIGH_VELOCITY_DISPUTE_FILING',
      name: 'High Velocity Dispute Filing',
      description: 'Triggers review when a user opens more than 5 dispute cases within 24 hours.',
      severity: 'MEDIUM',
      action: RiskAction.REVIEW,
    },
  ];

  for (const r of riskRulesData) {
    await prisma.riskRule.upsert({
      where: { code: r.code },
      update: {},
      create: r,
    });
  }

  console.log('✅ Risk Rules seeded');

  // 6. Seed System Settings & Feature Flags
  const settingsData = [
    { key: 'SYSTEM_MAINTENANCE_MODE', value: 'false', description: 'Global maintenance toggle', isPublic: true },
    { key: 'DEFAULT_BANK_SLA_HOURS', value: '72', description: 'CBN statutory SLA for interbank disputes', isPublic: true },
    { key: 'DEFAULT_TELCO_SLA_HOURS', value: '24', description: 'NCC statutory SLA for telecom billing disputes', isPublic: true },
    { key: 'DEFAULT_CURRENCY', value: 'NGN', description: 'Default operating currency', isPublic: true },
  ];

  for (const s of settingsData) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  const flagsData = [
    { name: 'OCR_EXTRACTION_ENABLED', isEnabled: true, description: 'Enable receipt text extraction' },
    { name: 'AUTO_SLA_ESCALATION_CRON', isEnabled: true, description: 'Automatically advance cases breaching SLA' },
    { name: 'PUBLIC_RESCUE_ENABLED', isEnabled: true, description: 'Allow public self-service case filing' },
  ];

  for (const f of flagsData) {
    await prisma.featureFlag.upsert({
      where: { name: f.name },
      update: {},
      create: f,
    });
  }

  console.log('✅ System Settings & Feature Flags seeded');
  console.log('🎉 [PayRescue NG] Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
