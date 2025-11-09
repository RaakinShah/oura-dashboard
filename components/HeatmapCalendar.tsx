'use client';

import { useState } from 'react';
import { SleepData, ActivityData, ReadinessData } from '@/lib/oura-api';

interface HeatmapCalendarProps {
  sleep: SleepData[];
  activity: ActivityData[];
  readiness: ReadinessData[];
}

type MetricType = 'sleep' | 'activity' | 'readiness';

export default function HeatmapCalendar({ sleep, activity, readiness }: HeatmapCalendarProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('sleep');
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const getColorForScore = (score: number | null): string => {
    if (score === null) return 'bg-gray-100';
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreForDay = (date: string): number | null => {
    if (selectedMetric === 'sleep') {
      const dayData = sleep.find(s => s.day === date);
      return dayData ? dayData.score : null;
    } else if (selectedMetric === 'activity') {
      const dayData = activity.find(a => a.day === date);
      return dayData ? dayData.score : null;
    } else {
      const dayData = readiness.find(r => r.day === date);
      return dayData ? dayData.score : null;
    }
  };

  const getDetailsForDay = (date: string): string => {
    if (selectedMetric === 'sleep') {
      const dayData = sleep.find(s => s.day === date);
      if (!dayData) return 'No data';
      return `Sleep: ${dayData.score}/100\nDuration: ${(dayData.total_sleep_duration / 3600).toFixed(1)}h\nDeep: ${Math.round(dayData.deep_sleep_duration / 60)}m\nREM: ${Math.round(dayData.rem_sleep_duration / 60)}m`;
    } else if (selectedMetric === 'activity') {
      const dayData = activity.find(a => a.day === date);
      if (!dayData) return 'No data';
      return `Activity: ${dayData.score}/100\nCalories: ${Math.round(dayData.active_calories)} kcal\nSteps: ${dayData.steps.toLocaleString()}`;
    } else {
      const dayData = readiness.find(r => r.day === date);
      if (!dayData) return 'No data';
      return `Readiness: ${dayData.score}/100\nHR: ${dayData.resting_heart_rate || 'N/A'} bpm\nHRV: ${dayData.hrv_balance || 'N/A'} ms`;
    }
  };

  // Generate calendar data for the last 12 weeks
  const generateCalendarDays = (): Date[] => {
    const days: Date[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 83); // 12 weeks = 84 days

    for (let i = 0; i < 84; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Group days by week
  const weeks: Date[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Activity Heatmap</h2>

        {/* Metric Selector */}
        <div className="flex gap-2">
          {(['sleep', 'activity', 'readiness'] as MetricType[]).map(metric => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                selectedMetric === metric
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="relative">
        {/* Day labels */}
        <div className="flex mb-2">
          <div className="w-12"></div>
          {dayLabels.map(day => (
            <div key={day} className="flex-1 text-center text-xs text-gray-500 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar rows */}
        <div className="space-y-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex items-center">
              {/* Week label */}
              <div className="w-12 text-xs text-gray-500 pr-2 text-right">
                {weekIndex % 2 === 0 ? `W${weekIndex / 2 + 1}` : ''}
              </div>

              {/* Days */}
              <div className="flex flex-1 gap-1">
                {week.map((date, dayIndex) => {
                  const dateString = date.toISOString().split('T')[0];
                  const score = getScoreForDay(dateString);
                  const colorClass = getColorForScore(score);
                  const isToday = dateString === new Date().toISOString().split('T')[0];

                  return (
                    <div
                      key={dayIndex}
                      className="flex-1 relative group"
                      onMouseEnter={() => setHoveredDay(dateString)}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      <div
                        className={`aspect-square ${colorClass} rounded-md transition-all duration-200 hover:scale-110 hover:shadow-lg cursor-pointer ${
                          isToday ? 'ring-2 ring-purple-600 ring-offset-1' : ''
                        }`}
                        title={getDetailsForDay(dateString)}
                      />

                      {/* Tooltip */}
                      {hoveredDay === dateString && (
                        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                          <div className="font-semibold mb-1">
                            {date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-gray-300 whitespace-pre-line">
                            {getDetailsForDay(dateString)}
                          </div>
                          {/* Arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="border-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Less</span>
          <div className="flex gap-1">
            {[
              'bg-gray-100',
              'bg-red-500',
              'bg-orange-500',
              'bg-yellow-500',
              'bg-blue-500',
              'bg-green-500'
            ].map((color, index) => (
              <div
                key={index}
                className={`w-4 h-4 ${color} rounded-sm`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">More</span>
        </div>

        <div className="text-xs text-gray-500">
          Last 12 weeks of {selectedMetric} data
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500 mb-1">Best Score</p>
          <p className="text-2xl font-bold text-green-600">
            {selectedMetric === 'sleep'
              ? Math.max(...sleep.map(s => s.score))
              : selectedMetric === 'activity'
              ? Math.max(...activity.map(a => a.score))
              : Math.max(...readiness.map(r => r.score))}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Average Score</p>
          <p className="text-2xl font-bold text-blue-600">
            {selectedMetric === 'sleep'
              ? Math.round(sleep.reduce((sum, s) => sum + s.score, 0) / sleep.length)
              : selectedMetric === 'activity'
              ? Math.round(activity.reduce((sum, a) => sum + a.score, 0) / activity.length)
              : Math.round(readiness.reduce((sum, r) => sum + r.score, 0) / readiness.length)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Days Tracked</p>
          <p className="text-2xl font-bold text-purple-600">
            {selectedMetric === 'sleep'
              ? sleep.length
              : selectedMetric === 'activity'
              ? activity.length
              : readiness.length}
          </p>
        </div>
      </div>
    </div>
  );
}
