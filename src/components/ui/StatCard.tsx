import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  alert?: boolean;
  alertText?: string;
  onClick?: () => void;
  accentColor?: 'purple' | 'blue' | 'emerald' | 'amber' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendPositive,
  alert,
  alertText,
  onClick,
  accentColor = 'purple',
}) => {
  const colorMap = {
    purple: 'text-[#714B67] bg-purple-50 border-purple-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
  };

  return (
    <div
      onClick={onClick}
      className={`odoo-card p-5 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300' : ''
      } ${alert ? 'border-amber-300 bg-amber-50/30' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
            {subtitle && <span className="text-xs text-slate-500 font-medium">{subtitle}</span>}
          </div>
        </div>
        <div className={`p-2.5 rounded-xl border ${colorMap[accentColor]}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        {trend ? (
          <span className={`text-xs font-medium flex items-center gap-1 ${trendPositive ? 'text-emerald-600' : 'text-slate-500'}`}>
            {trendPositive ? '↑' : '•'} {trend}
          </span>
        ) : (
          <span className="text-xs text-slate-400">Real-time synced</span>
        )}

        {alert && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 animate-pulse">
            {alertText || 'Action required'}
          </span>
        )}
      </div>
    </div>
  );
};
