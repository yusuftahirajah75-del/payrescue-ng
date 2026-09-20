import { CaseStatus } from '../types';

export function formatNaira(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₦0.00';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(num);
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  }).format(d);
}

export function formatTimeAgo(dateString?: string | null): string {
  if (!dateString) return '—';
  const d = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  return `${Math.max(1, diffMins)}m ago`;
}

export function getStatusBadgeConfig(status: CaseStatus): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'OPEN':
      return { label: 'Open', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'EVIDENCE_REQUIRED':
      return { label: 'Evidence Needed', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'EVIDENCE_REVIEW':
      return { label: 'Evidence Review', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'READY_FOR_COMPLAINT':
      return { label: 'Ready for Complaint', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'COMPLAINT_PREPARED':
      return { label: 'Complaint Ready', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
    case 'SUBMITTED':
      return { label: 'Submitted to Provider', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' };
    case 'PROVIDER_REVIEW':
      return { label: 'Provider Review', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
    case 'PENDING':
      return { label: 'Pending Settlement', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
    case 'RESOLVED':
      return { label: 'Resolved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'PARTIALLY_RESOLVED':
      return { label: 'Partially Resolved', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
    case 'REJECTED':
      return { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    case 'ESCALATED':
      return { label: 'Escalated to Regulator', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
    case 'CLOSED':
      return { label: 'Closed', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
    default:
      return { label: status, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
  }
}
