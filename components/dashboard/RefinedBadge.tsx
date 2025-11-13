import { memo } from 'react';
import { getBadgeLevel } from '@/lib/utils/calculations';
import { BADGE_LABELS } from '@/lib/constants';

interface RefinedBadgeProps {
  score: number;
}

export const RefinedBadge = memo(function RefinedBadge({ score }: RefinedBadgeProps) {
  const level = getBadgeLevel(score);
  const label = BADGE_LABELS[level.toUpperCase() as keyof typeof BADGE_LABELS];

  return <span className={`badge badge-${level}`}>{label}</span>;
});
