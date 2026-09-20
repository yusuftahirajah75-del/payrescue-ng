import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; className?: string }> = ({
  rows = 4,
  className = '',
}) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      <div className="h-6 bg-slate-200 rounded-lg w-1/3"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-100 rounded-xl w-full"></div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
        <div className="w-16 h-5 bg-slate-100 rounded-full"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="h-8 bg-slate-300 rounded w-3/4"></div>
      </div>
    </div>
  );
};
