import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  hover = false, 
  title,
  subtitle,
  headerAction,
  noPadding = false,
  className, 
  ...props 
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all',
          noPadding ? '' : 'p-6',
          hover && 'hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5',
          className
        )
      )}
      {...props}
    >
      {(title || headerAction) && (
        <div className={`flex items-start justify-between gap-4 border-b border-slate-100 ${noPadding ? 'p-6' : 'pb-4 mb-4'}`}>
          <div>
            {title && <h3 className="text-base font-bold font-display text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
