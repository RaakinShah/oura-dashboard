/**
 * Daily Notes & Journal Storage System
 * Stores user notes, mood, energy, and custom metrics locally
 */

export interface DailyNote {
  date: string; // YYYY-MM-DD
  note: string;
  mood?: 'excellent' | 'good' | 'okay' | 'poor' | 'terrible';
  energy?: number; // 1-10
  stress?: number; // 1-10
  tags?: string[]; // 'workout', 'sick', 'travel', 'alcohol', 'caffeine', etc.
  customMetrics?: {
    [key: string]: number | string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'sleep' | 'activity' | 'readiness' | 'custom';
  target: number;
  current: number;
  unit: string;
  startDate: string;
  targetDate: string;
  completed: boolean;
  progress: number; // 0-100
  streak: number;
}

const NOTES_STORAGE_KEY = 'oura_daily_notes';
const GOALS_STORAGE_KEY = 'oura_goals';

// Daily Notes Functions
export const getNotes = (): Record<string, DailyNote> => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(NOTES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading notes:', error);
    return {};
  }
};

export const getNote = (date: string): DailyNote | null => {
  const notes = getNotes();
  return notes[date] || null;
};

export const saveNote = (note: DailyNote): void => {
  if (typeof window === 'undefined') return;
  try {
    const notes = getNotes();
    notes[note.date] = {
      ...note,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving note:', error);
  }
};

export const deleteNote = (date: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const notes = getNotes();
    delete notes[date];
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error deleting note:', error);
  }
};

export const getNotesInRange = (startDate: string, endDate: string): DailyNote[] => {
  const notes = getNotes();
  return Object.values(notes)
    .filter(note => note.date >= startDate && note.date <= endDate)
    .sort((a, b) => b.date.localeCompare(a.date));
};

// Goals Functions
export const getGoals = (): Goal[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(GOALS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading goals:', error);
    return [];
  }
};

export const getGoal = (id: string): Goal | null => {
  const goals = getGoals();
  return goals.find(g => g.id === id) || null;
};

export const saveGoal = (goal: Goal): void => {
  if (typeof window === 'undefined') return;
  try {
    const goals = getGoals();
    const existingIndex = goals.findIndex(g => g.id === goal.id);

    if (existingIndex >= 0) {
      goals[existingIndex] = goal;
    } else {
      goals.push(goal);
    }

    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Error saving goal:', error);
  }
};

export const deleteGoal = (id: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const goals = getGoals().filter(g => g.id !== id);
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Error deleting goal:', error);
  }
};

export const updateGoalProgress = (id: string, current: number): void => {
  const goal = getGoal(id);
  if (!goal) return;

  const progress = Math.min(100, Math.round((current / goal.target) * 100));
  const completed = progress >= 100;

  saveGoal({
    ...goal,
    current,
    progress,
    completed,
  });
};

// Utility functions
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

export const getTodayDate = (): string => {
  return formatDate(new Date());
};

export const getMoodEmoji = (mood: DailyNote['mood']): string => {
  switch (mood) {
    case 'excellent': return '😄';
    case 'good': return '🙂';
    case 'okay': return '😐';
    case 'poor': return '😕';
    case 'terrible': return '😞';
    default: return '';
  }
};

export const getMoodColor = (mood: DailyNote['mood']): string => {
  switch (mood) {
    case 'excellent': return 'text-green-600';
    case 'good': return 'text-blue-600';
    case 'okay': return 'text-yellow-600';
    case 'poor': return 'text-orange-600';
    case 'terrible': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export const getTagColor = (tag: string): string => {
  const colors: Record<string, string> = {
    workout: 'bg-blue-100 text-blue-700',
    sick: 'bg-red-100 text-red-700',
    travel: 'bg-purple-100 text-purple-700',
    alcohol: 'bg-orange-100 text-orange-700',
    caffeine: 'bg-amber-100 text-amber-700',
    stress: 'bg-rose-100 text-rose-700',
    meditation: 'bg-indigo-100 text-indigo-700',
    social: 'bg-pink-100 text-pink-700',
  };
  return colors[tag] || 'bg-gray-100 text-gray-700';
};
