import { memo } from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface QuickStatCardProps {
  icon: LucideIcon;
  label: string;
  score: number;
  trend: number;
}

export const QuickStatCard = memo(function QuickStatCard({
  icon: Icon,
  label,
  score,
  trend,
}: QuickStatCardProps) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-9 hover:border-sage-300 hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <Icon className="h-5 w-5 text-stone-400" />
        <span className="text-stone-500 text-xs uppercase tracking-wider font-medium">
          {label}
        </span>
      </div>

      <div className="text-5xl font-light mb-4 tracking-tight">{score}</div>

      {trend !== 0 && (
        <div className="flex items-center gap-2 text-sm text-stone-600">
          {trend > 0 ? (
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-rose-600" />
          )}
          <span className="leading-relaxed">
            {trend > 0 ? '+' : ''}
            {trend} from last week
          </span>
        </div>
      )}
    </div>
  );
});
