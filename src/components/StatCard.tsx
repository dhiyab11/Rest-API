import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = false,
}) => {
  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        highlight
          ? 'bg-emerald-800 text-white border-emerald-700 shadow-md dark:bg-emerald-600 dark:text-white dark:border-emerald-500'
          : 'bg-emerald-50/60 hover:bg-white dark:bg-[#08150d] border-emerald-200 dark:border-emerald-900/60 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-bold tracking-wide ${
            highlight ? 'text-white/90' : 'text-emerald-900 dark:text-emerald-400'
          }`}
        >
          {title}
        </span>
        <div
          className={`p-2.5 rounded-xl ${
            highlight
              ? 'bg-white/20 text-white'
              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
          }`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span
          className={`text-2xl font-black tracking-tight ${
            highlight ? 'text-white' : 'text-emerald-950 dark:text-[#f0fdf4]'
          }`}
        >
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
              highlight
                ? 'bg-white/25 text-white dark:bg-emerald-950/30 dark:text-emerald-950'
                : trend.positive
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p
          className={`text-xs mt-1.5 ${
            highlight ? 'text-white/80 dark:text-emerald-950/80' : 'text-emerald-600/70 dark:text-emerald-400/70'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
