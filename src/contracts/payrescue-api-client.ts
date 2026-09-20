/**
 * PAYRESCUE NG — Frontend API Client Contracts & TypeScript Interfaces
 * Direct drop-in contract for React/Vite/Next.js client applications.
 */

export interface ApiResponse<T> {
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
    details?: Array<{ field: string; message: string }>;
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

export type ProviderCategory =
  | 'TELECOM'
  | 'ELECTRICITY'
  | 'CABLE_TV'
  | 'BANK'
  | 'PSP'
  | 'PAYMENT_GATEWAY'
  | 'MERCHANT'
  | 'OTHER_DIGITAL';

export type ReconciliationStatus =
  | 'MATCHED'
  | 'PARTIAL_MATCH'
  | 'UNMATCHED'
  | 'DUPLICATE'
  | 'MISMATCH'
  | 'NEEDS_REVIEW';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
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
}

export interface ProviderItem {
  id: string;
  code: string;
  name: string;
  category: ProviderCategory;
  logoUrl?: string;
  slaHours: number;
  requiredEvidence: string[];
}

export interface RescueCaseItem {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  category: string;
  status: CaseStatus;
  priority: string;
  claimAmount: string | number;
  currency: string;
  slaDeadline?: string;
  escalationLevel: number;
  provider?: ProviderItem;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineRecord {
  id: string;
  caseId: string;
  eventType: string;
  title: string;
  description: string;
  actorName: string;
  createdAt: string;
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  originalFilename: string;
  publicUrl?: string;
  fileSizeBytes: number;
  mimeType: string;
  sha256Hash: string;
  documentType: string;
  isVerifiedProof: boolean;
  createdAt: string;
}

export interface ReconciliationJobSummary {
  id: string;
  jobReference: string;
  totalRecords: number;
  matchedCount: number;
  partialCount: number;
  unmatchedCount: number;
  mismatchCount: number;
  status: string;
  completedAt?: string;
}

/**
 * Endpoints Catalog for Frontend Teams
 */
export const API_ENDPOINTS = {
  // Public
  PLATFORM_INFO: '/api/v1/public/platform',
  FEATURES: '/api/v1/public/features',
  PRICING: '/api/v1/public/pricing',
  FAQ: '/api/v1/public/faq',
  PROVIDERS_PUBLIC: '/api/v1/public/providers',
  STATUS: '/api/v1/public/status',
  CONTACT: '/api/v1/public/contact',

  // Auth
  REGISTER: '/api/v1/auth/register',
  LOGIN: '/api/v1/auth/login',
  REFRESH: '/api/v1/auth/refresh',
  LOGOUT: '/api/v1/auth/logout',
  ME: '/api/v1/auth/me',
  FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
  RESET_PASSWORD: '/api/v1/auth/reset-password',

  // Transactions & Cases
  TRANSACTIONS: '/api/v1/transactions',
  CASES: '/api/v1/cases',
  CASE_DETAILS: (id: string) => `/api/v1/cases/${id}`,
  CASE_STATUS: (id: string) => `/api/v1/cases/${id}/status`,
  CASE_ESCALATE: (id: string) => `/api/v1/cases/${id}/escalate`,

  // Evidence & OCR
  EVIDENCE_UPLOAD: '/api/v1/evidence/upload',
  EVIDENCE_DETAILS: (id: string) => `/api/v1/evidence/${id}`,
  OCR_EXTRACT: (evidenceId: string) => `/api/v1/ocr/extract/${evidenceId}`,

  // Classification & Complaints
  CLASSIFY: '/api/v1/classification/classify',
  GENERATE_COMPLAINT: (caseId: string) => `/api/v1/complaints/generate/${caseId}`,
  SUBMIT_COMPLAINT: (complaintId: string) => `/api/v1/complaints/submit/${complaintId}`,

  // Multi-Tenant Business & Reconciliation
  RECONCILIATION_CSV: (businessId: string) => `/api/v1/reconciliation/${businessId}/csv`,
  RECONCILIATION_MANUAL: (businessId: string) => `/api/v1/reconciliation/${businessId}/manual`,
  RECONCILIATION_JOB: (businessId: string, jobId: string) => `/api/v1/reconciliation/${businessId}/jobs/${jobId}`,
  PAYMENT_REQUESTS: (businessId: string) => `/api/v1/verification/${businessId}/requests`,
  PAYMENT_VERIFY: (businessId: string) => `/api/v1/verification/${businessId}/verify`,

  // Developer Platform (TrustPay)
  DEVELOPER_KEYS: (businessId: string) => `/api/v1/developer/${businessId}/keys`,
  DEVELOPER_WEBHOOKS: (businessId: string) => `/api/v1/developer/${businessId}/webhooks`,

  // Billing
  BILLING_PLANS: '/api/v1/billing/plans',
  BILLING_SUBSCRIPTION: (businessId: string) => `/api/v1/billing/${businessId}/subscription`,
  BILLING_SUBSCRIBE: (businessId: string) => `/api/v1/billing/${businessId}/subscribe`,

  // Analytics & Admin
  ANALYTICS_OVERVIEW: '/api/v1/analytics/overview',
  ADMIN_USERS: '/api/v1/admin/users',
  ADMIN_AUDIT_LOGS: '/api/v1/admin/audit-logs',
};
