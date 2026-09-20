export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  requestId: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string; message: string }>;
  };
  requestId: string;
}

export type Role =
  | 'USER'
  | 'BUSINESS_OWNER'
  | 'BUSINESS_ADMIN'
  | 'BUSINESS_AGENT'
  | 'SUPPORT_AGENT'
  | 'FRAUD_ANALYST'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export type CaseStatus =
  | 'OPEN'
  | 'EVIDENCE_REQUIRED'
  | 'EVIDENCE_REVIEW'
  | 'READY_FOR_COMPLAINT'
  | 'COMPLAINT_PREPARED'
  | 'SUBMITTED'
  | 'PROVIDER_REVIEW'
  | 'PENDING'
  | 'RESOLVED'
  | 'PARTIALLY_RESOLVED'
  | 'REJECTED'
  | 'ESCALATED'
  | 'CLOSED';

export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type DisputeCategory =
  | 'FAILED_SERVICE'
  | 'PENDING'
  | 'DUPLICATE'
  | 'WRONG_AMOUNT'
  | 'PAYMENT_NOT_RECEIVED'
  | 'SERVICE_NOT_RECEIVED'
  | 'POSSIBLE_MISMATCH'
  | 'NEEDS_VERIFICATION'
  | 'DEBITED_NOT_CREDITED'
  | 'FAILED_TRANSFER'
  | 'ATM_DISPENSE_ERROR'
  | 'POS_DECLINE_DEBIT'
  | 'AIRTIME_DATA_FAILURE'
  | 'BILL_PAYMENT_FAILURE'
  | 'UNAUTHORIZED_DEBIT'
  | 'CRYPTO_P2P_SCAM'
  | 'OTHER';

export type ProviderCategory =
  | 'TELECOM'
  | 'ELECTRICITY'
  | 'CABLE_TV'
  | 'BANK'
  | 'PSP'
  | 'PAYMENT_GATEWAY'
  | 'MERCHANT'
  | 'OTHER_DIGITAL';

export type TransactionType =
  | 'AIRTIME'
  | 'DATA'
  | 'ELECTRICITY_TOKEN'
  | 'CABLE_SUBSCRIPTION'
  | 'BANK_TRANSFER'
  | 'GATEWAY_PAYMENT'
  | 'MERCHANT_CHECKOUT'
  | 'SUBSCRIPTION_BILL'
  | 'OTHER';

export type TransactionStatus =
  | 'PENDING'
  | 'SUCCESS'
  | 'FAILED'
  | 'REVERSED'
  | 'PARTIALLY_REFUNDED'
  | 'DISPUTED'
  | 'UNKNOWN';

export type ReconciliationStatus =
  | 'MATCHED'
  | 'PARTIAL_MATCH'
  | 'UNMATCHED'
  | 'DUPLICATE'
  | 'MISMATCH'
  | 'NEEDS_REVIEW';

export type RiskAction = 'ALLOW' | 'VERIFY' | 'REVIEW' | 'BLOCK';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  phone?: string | null;
  phoneNumber?: string | null;
  role: Role;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  businesses?: Array<{
    id: string;
    name: string;
    slug: string;
    role: Role;
  }>;
  businessMembers?: Array<{
    id: string;
    role: Role;
    title?: string;
    business: {
      id: string;
      name: string;
      slug: string;
      kybStatus: string;
      currency: string;
    };
  }>;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  registrationNumber?: string | null;
  taxIdentificationNo?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  websiteUrl?: string | null;
  kybStatus: string;
  currency: string;
  createdAt: string;
  members?: Array<{
    id: string;
    role: Role;
    title?: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  }>;
}

export interface Provider {
  id: string;
  code: string;
  name: string;
  category: ProviderCategory;
  logoUrl?: string | null;
  website?: string | null;
  supportEmail?: string | null;
  supportPhone?: string | null;
  complaintPortalUrl?: string | null;
  slaHours: number;
  requiredEvidence: string[];
  complaintTemplate?: string | null;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  internalReference: string;
  publicReference: string;
  amount: number | string;
  currency: string;
  transactionType: TransactionType;
  providerId?: string | null;
  provider?: Provider | null;
  merchantName?: string | null;
  senderIdentifier?: string | null;
  recipientIdentifier?: string | null;
  channel?: string | null;
  status: TransactionStatus;
  claimedStatus?: TransactionStatus | null;
  verifiedStatus?: TransactionStatus | null;
  transactionTimestamp: string;
  source: string;
  createdAt: string;
  events?: Array<{
    id: string;
    actorType: string;
    actorId?: string | null;
    previousStatus?: TransactionStatus | null;
    newStatus: TransactionStatus;
    reason?: string | null;
    createdAt: string;
  }>;
}

export interface RescueCase {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  userId: string;
  businessId?: string | null;
  transactionId: string;
  transaction: Transaction;
  providerId?: string | null;
  provider?: Provider | null;
  category: DisputeCategory;
  status: CaseStatus;
  priority: CasePriority;
  claimAmount: number | string;
  currency: string;
  expectedResolution?: string | null;
  slaDeadline?: string | null;
  escalationLevel: number;
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  evidence?: Evidence[];
  timelineRecords?: CaseTimelineRecord[];
  complaints?: Complaint[];
  riskSignals?: RiskSignal[];
}

export interface CaseTimelineRecord {
  id: string;
  caseId: string;
  eventType: string;
  title: string;
  description: string;
  actorName: string;
  isInternal: boolean;
  createdAt: string;
}

export interface Evidence {
  id: string;
  caseId: string;
  originalFilename: string;
  fileName?: string;
  publicUrl?: string | null;
  fileSizeBytes: number;
  mimeType: string;
  sha256Hash: string;
  status: 'PENDING_SCAN' | 'CLEAN' | 'SUSPICIOUS' | 'INFECTED' | 'REJECTED';
  documentType: string;
  isVerifiedProof: boolean;
  createdAt: string;
  ocrExtractions?: OcrExtraction[];
  ocrExtraction?: OcrExtraction;
}

export interface OcrExtraction {
  id: string;
  extractedAmount?: number | null;
  extractedReference?: string | null;
  extractedDate?: string | null;
  extractedBank?: string | null;
  extractedNarration?: string | null;
  rawText?: string | null;
  rawTextPreview?: string | null;
  confidenceScore: number;
  warnings: string[];
  requiresManualVerification: boolean;
  createdAt: string;
}

export interface Complaint {
  id: string;
  complaintRef: string;
  caseId: string;
  providerId?: string | null;
  subject: string;
  contentBody: string;
  bodyText?: string;
  regulatorReference?: string;
  structuredSummary: any;
  isRegulatoryFormat: boolean;
  createdAt: string;
  submissions?: Array<{
    id: string;
    channel: string;
    recipient?: string | null;
    status: string;
    deliveredAt?: string | null;
    createdAt: string;
  }>;
}

export interface ReconciliationJob {
  id: string;
  businessId: string;
  jobReference: string;
  totalRecords: number;
  matchedCount: number;
  partialCount: number;
  unmatchedCount: number;
  mismatchCount: number;
  matchedRecords?: number;
  partialRecords?: number;
  unmatchedRecords?: number;
  mismatchRecords?: number;
  executionTimeMs?: number;
  status: string;
  sourceFileName?: string | null;
  completedAt?: string | null;
  createdAt: string;
  results?: ReconciliationResult[];
}

export interface ReconciliationResult {
  id: string;
  jobId: string;
  claimedReference: string;
  actualReference?: string | null;
  claimedAmount: number | string;
  actualAmount?: number | string | null;
  settledAmount?: number | string | null;
  status: ReconciliationStatus;
  matchStatus?: ReconciliationStatus;
  confidenceScore: number;
  discrepancyReason?: string | null;
  matchedTransactionId?: string | null;
  createdAt: string;
}

export interface PaymentRequest {
  id: string;
  businessId: string;
  requestReference: string;
  paymentReference?: string;
  expectedAmount: number | string;
  currency: string;
  payerIdentifier?: string | null;
  description?: string | null;
  isFulfilled: boolean;
  status?: string;
  expiresAt?: string | null;
  createdAt: string;
}

export interface VerificationResult {
  id: string;
  paymentRequestId?: string | null;
  transactionId?: string | null;
  claimedReference: string;
  verifiedAmount?: number | string | null;
  settledAmount?: number | string | null;
  isConfirmed: boolean;
  isVerified?: boolean;
  status?: string;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';
  confidenceScore?: number;
  reason: string;
  verificationNotes?: string;
  createdAt: string;
}

export interface RiskSignal {
  id: string;
  caseId?: string | null;
  transactionRef: string;
  ruleCode: string;
  severity: string;
  recommendedAction: RiskAction;
  confidenceScore: number;
  reasonDetails: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  businessId: string;
  name: string;
  keyPrefix: string;
  prefix?: string;
  environment: 'live' | 'test';
  scopes: string[];
  rateLimit: number;
  lastUsedAt?: string | null;
  createdAt: string;
  rawSecretKey?: string;
}

export interface Webhook {
  id: string;
  businessId: string;
  targetUrl: string;
  secretKey: string;
  subscribedEvents: string[];
  isActive: boolean;
  createdAt: string;
  deliveries?: Array<{
    id: string;
    eventType: string;
    payload: any;
    responseStatus?: number | null;
    isSuccess: boolean;
    deliveredAt?: string | null;
    createdAt: string;
  }>;
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  tier: string;
  description: string;
  monthlyPriceNgn: number | string;
  annualPriceNgn: number | string;
  priceNgn?: number | string;
  maxCasesPerMonth: number;
  reconciliationQuotaLimit?: number;
  hasApiAccess: boolean;
  hasBulkRecon: boolean;
  features: string[];
}

export interface Subscription {
  id: string;
  businessId: string;
  planId: string;
  plan: Plan;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  body: string;
  linkUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}
