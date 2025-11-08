'use client';

import { useState, useEffect } from 'react';
import { X, Save, Target } from 'lucide-react';
import { Goal, saveGoal } from '@/lib/notes-storage';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  existingGoal?: Goal;
}

const GOAL_TYPES: Array<{ value: Goal['type']; label: string; icon: string }> = [
  { value: 'sleep', label: 'Sleep', icon: '🌙' },
  { value: 'activity', label: 'Activity', icon: '🏃' },
  { value: 'readiness', label: 'Readiness', icon: '❤️' },
  { value: 'custom', label: 'Custom', icon: '⭐' },
];

export default function AddGoalModal({ isOpen, onClose, onSave, existingGoal }: AddGoalModalProps) {
  const [goal, setGoal] = useState<Partial<Goal>>({
    id: existingGoal?.id || `goal-${Date.now()}`,
    title: existingGoal?.title || '',
    description: existingGoal?.description || '',
    type: existingGoal?.type || 'sleep',
    target: existingGoal?.target || 85,
    current: existingGoal?.current || 0,
    unit: existingGoal?.unit || 'score',
    startDate: existingGoal?.startDate || new Date().toISOString().split('T')[0],
    targetDate: existingGoal?.targetDate || '',
    completed: existingGoal?.completed || false,
    progress: existingGoal?.progress || 0,
    streak: existingGoal?.streak || 0,
  });

  useEffect(() => {
    if (isOpen && existingGoal) {
      setGoal(existingGoal);
    } else if (isOpen && !existingGoal) {
      setGoal({
        id: `goal-${Date.now()}`,
        title: '',
        description: '',
        type: 'sleep',
        target: 85,
        current: 0,
        unit: 'score',
        startDate: new Date().toISOString().split('T')[0],
        targetDate: '',
        completed: false,
        progress: 0,
        streak: 0,
      });
    }
  }, [isOpen, existingGoal]);

  const handleSave = () => {
    if (!goal.title || !goal.target || !goal.targetDate) {
      alert('Please fill in all required fields');
      return;
    }

    const progress = Math.min(100, Math.round((goal.current! / goal.target) * 100));
    const completed = progress >= 100;

    saveGoal({
      ...goal,
      progress,
      completed,
    } as Goal);

    onSave?.();
    onClose();
  };

  const getUnitOptions = (type: Goal['type']) => {
    switch (type) {
      case 'sleep':
        return ['score', 'hours', 'minutes'];
      case 'activity':
        return ['score', 'calories', 'steps', 'minutes'];
      case 'readiness':
        return ['score', 'points'];
      case 'custom':
        return ['score', 'days', 'times', 'units'];
      default:
        return ['score'];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-600" />
            {existingGoal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Goal Type */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Goal Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {GOAL_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setGoal(prev => ({
                    ...prev,
                    type: type.value,
                    unit: getUnitOptions(type.value)[0]
                  }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    goal.type === type.value
                      ? 'border-purple-500 bg-purple-50 scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-3xl mb-1">{type.icon}</div>
                  <div className="text-xs font-medium text-gray-700">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Goal Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={goal.title}
              onChange={(e) => setGoal(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Achieve 85+ Sleep Score for 30 Days"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Description
            </label>
            <textarea
              value={goal.description}
              onChange={(e) => setGoal(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What do you want to achieve and why?"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Target & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Target <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={goal.target}
                onChange={(e) => setGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Unit
              </label>
              <select
                value={goal.unit}
                onChange={(e) => setGoal(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {getUnitOptions(goal.type!).map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Current Progress */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Current Progress
            </label>
            <input
              type="number"
              value={goal.current}
              onChange={(e) => setGoal(prev => ({ ...prev, current: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Start Date
              </label>
              <input
                type="date"
                value={goal.startDate}
                onChange={(e) => setGoal(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Target Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={goal.targetDate}
                onChange={(e) => setGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {existingGoal ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </div>
    </div>
  );
}
