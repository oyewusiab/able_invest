import React from 'react';

export default function Badge({ status, variant }) {
  const normalized = (status || '').toUpperCase();

  const getStyle = () => {
    if (variant === 'zero-interest' || normalized === 'ZERO_INTEREST' || normalized === '0% INTEREST') {
      return 'bg-teal-50 text-teal-700 border-teal-200';
    }
    if (variant === 'interest' || normalized.includes('INTEREST') || normalized.includes('RATE')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }

    switch (normalized) {
      case 'ACTIVE':
      case 'APPROVED':
      case 'VERIFIED':
      case 'COMPLETED':
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING':
      case 'UNDER_REVIEW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'REJECTED':
      case 'DEFAULTED':
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'REPAID':
      case 'MATURED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SUPER_ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'LOAN_OFFICER':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'CUSTOMER':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const formatText = (text) => {
    return text.replace(/_/g, ' ');
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${getStyle()}`}>
      {formatText(status || '')}
    </span>
  );
}
