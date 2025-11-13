/**
 * Goal tracking and achievement utilities
 */

export interface Goal {
  id: string;
  metric: string;
  target: number;
  current: number;
  deadline?: Date;
  type: 'greater' | 'less' | 'equal' | 'range';
  range?: { min: number; max: number };
}

export interface GoalProgress {
  goal: Goal;
  percentage: number;
  isAchieved: boolean;
  daysRemaining?: number;
  requiredDailyProgress?: number;
  trend: 'on-track' | 'behind' | 'ahead';
}

/**
 * Calculate goal progress
 */
export function calculateGoalProgress(goal: Goal): GoalProgress {
  let percentage = 0;
  let isAchieved = false;

  switch (goal.type) {
    case 'greater':
      percentage = Math.min(100, (goal.current / goal.target) * 100);
      isAchieved = goal.current >= goal.target;
      break;
    case 'less':
      percentage = Math.min(100, ((goal.target - goal.current) / goal.target) * 100);
      isAchieved = goal.current <= goal.target;
      break;
    case 'equal':
      percentage = goal.current === goal.target ? 100 : 0;
      isAchieved = goal.current === goal.target;
      break;
    case 'range':
      if (goal.range) {
        const inRange = goal.current >= goal.range.min && goal.current <= goal.range.max;
        percentage = inRange ? 100 : 0;
        isAchieved = inRange;
      }
      break;
  }

  let daysRemaining: number | undefined;
  let requiredDailyProgress: number | undefined;
  let trend: 'on-track' | 'behind' | 'ahead' = 'on-track';

  if (goal.deadline) {
    const now = new Date();
    const deadline = new Date(goal.deadline);
    daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    if (daysRemaining > 0) {
      const remaining = goal.target - goal.current;
      requiredDailyProgress = remaining / daysRemaining;

      if (percentage >= 90) {
        trend = 'ahead';
      } else if (percentage < 50 && daysRemaining < 7) {
        trend = 'behind';
      }
    }
  }

  return {
    goal,
    percentage,
    isAchieved,
    daysRemaining,
    requiredDailyProgress,
    trend,
  };
}

/**
 * Detect streaks in boolean data
 */
export interface Streak {
  current: number;
  longest: number;
  total: number;
  lastDate?: Date;
}

export function detectStreak(data: Array<{ date: Date; achieved: boolean }>): Streak {
  let current = 0;
  let longest = 0;
  let total = 0;
  let temp = 0;
  let lastDate: Date | undefined;

  // Sort by date
  const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].achieved) {
      temp++;
      total++;
      lastDate = sorted[i].date;
    } else {
      longest = Math.max(longest, temp);
      temp = 0;
    }
  }

  longest = Math.max(longest, temp);

  // Check if current streak is ongoing (last entry)
  if (sorted.length > 0 && sorted[sorted.length - 1].achieved) {
    current = temp;
  }

  return { current, longest, total, lastDate };
}

/**
 * Calculate consistency score (0-100)
 */
export function calculateConsistency(
  data: Array<{ date: Date; value: number }>,
  target: number,
  tolerance: number = 0.1
): number {
  if (data.length === 0) return 0;

  const withinRange = data.filter((point) => {
    const diff = Math.abs(point.value - target);
    return diff <= target * tolerance;
  });

  return (withinRange.length / data.length) * 100;
}

/**
 * Predict goal achievement date based on current trend
 */
export function predictAchievementDate(
  goal: Goal,
  historicalData: Array<{ date: Date; value: number }>
): Date | null {
  if (historicalData.length < 2) return null;

  // Calculate average daily progress
  const sorted = [...historicalData].sort((a, b) => a.date.getTime() - b.date.getTime());
  const firstValue = sorted[0].value;
  const lastValue = sorted[sorted.length - 1].value;
  const daysDiff = (sorted[sorted.length - 1].date.getTime() - sorted[0].date.getTime()) / (1000 * 60 * 60 * 24);
  
  if (daysDiff === 0) return null;

  const dailyProgress = (lastValue - firstValue) / daysDiff;

  if (dailyProgress <= 0) return null;

  const remaining = goal.target - goal.current;
  const daysNeeded = remaining / dailyProgress;

  const achievementDate = new Date();
  achievementDate.setDate(achievementDate.getDate() + Math.ceil(daysNeeded));

  return achievementDate;
}
