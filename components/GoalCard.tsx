'use client';

import { Goal } from '@/lib/notes-storage';
import { Target, TrendingUp, Calendar, Trash2, Edit2, Award } from 'lucide-react';
import { formatShortDate } from '@/lib/date-utils';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

export default function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const getTypeColor = (type: Goal['type']) => {
    switch (type) {
      case 'sleep':
        return 'from-indigo-500 to-purple-600';
      case 'activity':
        return 'from-green-500 to-emerald-600';
      case 'readiness':
        return 'from-red-500 to-rose-600';
      case 'custom':
        return 'from-blue-500 to-cyan-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeIcon = (type: Goal['type']) => {
    switch (type) {
      case 'sleep':
        return '🌙';
      case 'activity':
        return '🏃';
      case 'readiness':
        return '❤️';
      case 'custom':
        return '⭐';
      default:
        return '🎯';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const daysRemaining = Math.ceil(
    (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const isOverdue = daysRemaining < 0 && !goal.completed;
  const isCompleted = goal.completed;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden card-hover ${
      isCompleted ? 'opacity-75' : ''
    }`}>
      {/* Header with gradient */}
      <div className={`bg-gradient-to-r ${getTypeColor(goal.type)} p-4 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getTypeIcon(goal.type)}</div>
            <div>
              <h3 className="font-bold text-lg">{goal.title}</h3>
              <p className="text-white/80 text-sm capitalize">{goal.type} Goal</p>
            </div>
          </div>
          {isCompleted && (
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
              <Award className="h-4 w-4" />
              <span className="text-xs font-bold">Completed</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Description */}
        {goal.description && (
          <p className="text-gray-600 text-sm">{goal.description}</p>
        )}

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Progress</span>
            <span className="text-lg font-bold text-gray-900">{goal.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${getProgressColor(goal.progress)} transition-all duration-500`}
              style={{ width: `${Math.min(goal.progress, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>{goal.current} / {goal.target} {goal.unit}</span>
            {goal.streak > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-orange-500">🔥</span>
                {goal.streak} day streak
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-xs text-gray-500">Started</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatShortDate(goal.startDate)}
            </p>
          </div>

          <div className={`rounded-xl p-3 ${
            isOverdue ? 'bg-red-50' : isCompleted ? 'bg-green-50' : 'bg-blue-50'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <Target className={`h-4 w-4 ${
                isOverdue ? 'text-red-500' : isCompleted ? 'text-green-500' : 'text-blue-500'
              }`} />
              <span className="text-xs text-gray-500">
                {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Target'}
              </span>
            </div>
            <p className={`text-sm font-semibold ${
              isOverdue ? 'text-red-900' : isCompleted ? 'text-green-900' : 'text-blue-900'
            }`}>
              {isCompleted
                ? 'Done!'
                : isOverdue
                ? `${Math.abs(daysRemaining)} days ago`
                : `${daysRemaining} days`
              }
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => onEdit(goal)}
            className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="flex-1 py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
