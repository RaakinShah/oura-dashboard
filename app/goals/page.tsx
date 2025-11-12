'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useOuraData } from '@/hooks/useOura';
import { Goal, getGoals, deleteGoal, updateGoalProgress } from '@/lib/notes-storage';
import AddGoalModal from '@/components/AddGoalModal';
import GoalCard from '@/components/GoalCard';
import { Target, Plus, TrendingUp, Award, AlertCircle, Calendar } from 'lucide-react';

export default function GoalsPage() {
  const { sleep, activity, readiness, loading, hasToken } = useOuraData();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const hasUpdatedGoals = useRef(false);

  const loadGoals = useCallback(() => {
    setGoals(getGoals());
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // Auto-update goal progress based on Oura data
  useEffect(() => {
    if (sleep.length > 0 && activity.length > 0 && readiness.length > 0 && goals.length > 0 && !hasUpdatedGoals.current) {
      const latestSleep = sleep[sleep.length - 1];
      const latestActivity = activity[activity.length - 1];
      const latestReadiness = readiness[readiness.length - 1];

      let hasChanges = false;

      goals.forEach(goal => {
        if (goal.completed) return;

        let currentValue = goal.current;

        // Auto-update based on goal type
        if (goal.type === 'sleep' && goal.unit === 'score') {
          currentValue = latestSleep.score;
        } else if (goal.type === 'activity' && goal.unit === 'score') {
          currentValue = latestActivity.score;
        } else if (goal.type === 'readiness' && goal.unit === 'score') {
          currentValue = latestReadiness.score;
        }

        if (currentValue !== goal.current) {
          updateGoalProgress(goal.id, currentValue);
          hasChanges = true;
        }
      });

      // Reload goals after updates only if there were changes
      if (hasChanges) {
        loadGoals();
        hasUpdatedGoals.current = true;
      }
    }
  }, [sleep, activity, readiness, goals, loadGoals]);

  const handleDeleteGoal = (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(id);
      loadGoals();
    }
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsAddModalOpen(true);
  };

  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setEditingGoal(undefined);
  };

  const handleModalSave = () => {
    loadGoals();
  };

  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    if (filter === 'completed') return goal.completed;
    if (filter === 'active') return !goal.completed && new Date(goal.targetDate) >= new Date();
    if (filter === 'overdue') {
      const daysRemaining = Math.ceil(
        (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return !goal.completed && daysRemaining < 0;
    }
    return true;
  });

  const stats = {
    total: goals.length,
    active: goals.filter(g => !g.completed && new Date(g.targetDate) >= new Date()).length,
    completed: goals.filter(g => g.completed).length,
    overdue: goals.filter(g => {
      const daysRemaining = Math.ceil(
        (new Date(g.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return !g.completed && daysRemaining < 0;
    }).length,
  };

  if (!hasToken || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Target className="h-10 w-10 text-purple-600" />
            Goals
          </h1>
          <p className="text-gray-600">
            Track your health and fitness goals with data-driven insights
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-gray-600">Total Goals</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">Active</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-4 border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-gray-600">Overdue</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.overdue}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          {(['all', 'active', 'completed', 'overdue'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Add Goal Button */}
        <button
          onClick={() => {
            setEditingGoal(undefined);
            setIsAddModalOpen(true);
          }}
          className="w-full py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-3 animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          <Plus className="h-6 w-6" />
          Create New Goal
        </button>

        {/* Goals Grid */}
        {filteredGoals.length === 0 ? (
          <div className="text-center py-12 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'all' ? 'No Goals Yet' : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Goals`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Create your first goal to start tracking your progress'
                : `You do not have any ${filter} goals at the moment`}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => {
                  setEditingGoal(undefined);
                  setIsAddModalOpen(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Create Your First Goal
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            {filteredGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        )}
      </div>

      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        existingGoal={editingGoal}
      />
    </>
  );
}
