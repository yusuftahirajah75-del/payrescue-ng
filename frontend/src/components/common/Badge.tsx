import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CaseStatus, ReconciliationStatus } from '../../types';
import { getStatusBadgeConfig } from '../../utils/formatters';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 rounded-full border',
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export const CaseStatusBadge: React.FC<{ status: CaseStatus; className?: string }> = ({ status, className }) => {
  const cfg = getStatusBadgeConfig(status);
  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
          cfg.bg,
          cfg.text,
          cfg.border,
          className
        )
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {cfg.label}
    </span>
  );
};

export const ReconciliationBadge: React.FC<{ status: ReconciliationStatus; className?: string }> = ({
  status,
  className,
}) => {
  const config = {
    MATCHED: { label: 'Matched', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    PARTIAL_MATCH: { label: 'Partial Match', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    UNMATCHED: { label: 'Unmatched', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    DUPLICATE: { label: 'Duplicate Entry', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    MISMATCH: { label: 'Amount Mismatch', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    NEEDS_REVIEW: { label: 'Needs Review', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  }[status] || { label: status, bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
          config.bg,
          config.text,
          config.border,
          className
        )
      )}
    >
      {config.label}
    </span>
  );
};
