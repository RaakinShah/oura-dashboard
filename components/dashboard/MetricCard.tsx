import { memo } from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface MetricDetail {
  label: string;
  value: string;
}

interface MetricCardProps {
  href: string;
  icon: LucideIcon;
  label: string;
  timeLabel: string;
  score: number;
  details: MetricDetail[];
  badge: React.ReactNode;
  weeklyAvg: number;
  trend: number;
}

export const MetricCard = memo(function MetricCard({
  href,
  icon: Icon,
  label,
  timeLabel,
  score,
  details,
  badge,
  weeklyAvg,
  trend,
}: MetricCardProps) {
  return (
    <Link href={href} className="metric-card group cursor-pointer">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center border border-stone-200">
            <Icon className="h-6 w-6 text-stone-700" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-medium text-stone-500 mb-1">
              {label}
            </div>
            <div className="text-xs text-stone-400">{timeLabel}</div>
          </div>
        </div>
        {badge}
      </div>

      {/* Score */}
      <div className="mb-8">
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-5xl font-light tracking-tight">{score}</span>
          <span className="text-2xl text-stone-400 font-light">/100</span>
        </div>

        {/* Details */}
        <div className="space-y-4">
          {details.map((detail, i) => (
            <div
              key={i}
              className={`flex items-center justify-between text-sm py-2 ${
                i < details.length - 1 ? 'border-b border-stone-100' : ''
              }`}
            >
              <span className="text-stone-500">{detail.label}</span>
              <span className="font-medium text-stone-900">{detail.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Average */}
      <div className="border-t border-stone-200 pt-6">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-medium text-stone-500">
            7-Day Average
          </span>
          <div className="flex items-center gap-3">
            <span className="font-medium text-xl text-stone-900">{weeklyAvg}</span>
            {trend !== 0 && (
              <span
                className={`text-sm font-medium px-2 py-1 rounded-md ${
                  trend > 0
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-rose-700 bg-rose-50'
                }`}
              >
                {trend > 0 ? '+' : ''}
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});
