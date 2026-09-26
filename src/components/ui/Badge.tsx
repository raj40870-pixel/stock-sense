import React from 'react';
import { OperationStatus, OperationType } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'status' | 'type' | 'stock' | 'default';
  status?: OperationStatus;
  type?: OperationType;
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  type,
  stockStatus,
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  if (variant === 'status' && status) {
    const statusMap = {
      draft: 'bg-slate-100 text-slate-700 border-slate-200',
      waiting: 'bg-amber-50 text-amber-800 border-amber-200',
      ready: 'bg-blue-50 text-blue-800 border-blue-200',
      done: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      canceled: 'bg-rose-50 text-rose-800 border-rose-200',
    };

    const dotMap = {
      draft: 'bg-slate-400',
      waiting: 'bg-amber-500',
      ready: 'bg-blue-500',
      done: 'bg-emerald-500',
      canceled: 'bg-rose-500',
    };

    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClasses} ${statusMap[status]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dotMap[status]}`} />
        <span className="capitalize">{status}</span>
      </span>
    );
  }

  if (variant === 'type' && type) {
    const typeMap = {
      receipt: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      delivery: 'bg-purple-50 text-purple-800 border-purple-200',
      internal: 'bg-blue-50 text-blue-800 border-blue-200',
      adjustment: 'bg-amber-50 text-amber-800 border-amber-200',
    };

    const labelMap = {
      receipt: 'Receipt (+Stock)',
      delivery: 'Delivery (-Stock)',
      internal: 'Internal Transfer',
      adjustment: 'Stock Adjustment',
    };

    return (
      <span className={`inline-flex items-center font-semibold rounded-md border ${sizeClasses} ${typeMap[type]}`}>
        {labelMap[type]}
      </span>
    );
  }

  if (variant === 'stock' && stockStatus) {
    if (stockStatus === 'out_of_stock') {
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
          Out of Stock
        </span>
      );
    }
    if (stockStatus === 'low_stock') {
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          Low Stock Alert
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Healthy Stock
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
      {children}
    </span>
  );
};
