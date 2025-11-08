'use client';

import { useState, useEffect } from 'react';
import { X, Save, Tag as TagIcon } from 'lucide-react';
import { DailyNote, saveNote, getNote, getMoodEmoji, getTagColor, getTodayDate } from '@/lib/notes-storage';

interface DailyNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  date?: string;
  onSave?: () => void;
}

const MOOD_OPTIONS: Array<{ value: DailyNote['mood']; label: string; emoji: string }> = [
  { value: 'excellent', label: 'Excellent', emoji: '😄' },
  { value: 'good', label: 'Good', emoji: '🙂' },
  { value: 'okay', label: 'Okay', emoji: '😐' },
  { value: 'poor', label: 'Poor', emoji: '😕' },
  { value: 'terrible', label: 'Terrible', emoji: '😞' },
];

const TAG_OPTIONS = [
  'workout', 'sick', 'travel', 'alcohol', 'caffeine',
  'stress', 'meditation', 'social', 'work', 'family'
];

export default function DailyNoteModal({ isOpen, onClose, date, onSave }: DailyNoteModalProps) {
  const noteDate = date || getTodayDate();
  const [note, setNote] = useState<DailyNote>({
    date: noteDate,
    note: '',
    mood: undefined,
    energy: 5,
    stress: 5,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (isOpen) {
      const existingNote = getNote(noteDate);
      if (existingNote) {
        setNote(existingNote);
      } else {
        setNote({
          date: noteDate,
          note: '',
          mood: undefined,
          energy: 5,
          stress: 5,
          tags: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }, [isOpen, noteDate]);

  const handleSave = () => {
    saveNote(note);
    onSave?.();
    onClose();
  };

  const toggleTag = (tag: string) => {
    setNote(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl font-bold text-gray-900">Daily Note</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(noteDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Mood */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              How did you feel today?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {MOOD_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setNote(prev => ({ ...prev, mood: option.value }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    note.mood === option.value
                      ? 'border-purple-500 bg-purple-50 scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-3xl mb-1">{option.emoji}</div>
                  <div className="text-xs font-medium text-gray-700">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center justify-between">
              <span>Energy Level</span>
              <span className="text-purple-600 text-lg font-bold">{note.energy}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={note.energy}
              onChange={(e) => setNote(prev => ({ ...prev, energy: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Stress Level */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center justify-between">
              <span>Stress Level</span>
              <span className="text-rose-600 text-lg font-bold">{note.stress}/10</span>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={note.stress}
              onChange={(e) => setNote(prev => ({ ...prev, stress: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
              <TagIcon className="h-4 w-4" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    note.tags?.includes(tag)
                      ? getTagColor(tag)
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Notes
            </label>
            <textarea
              value={note.note}
              onChange={(e) => setNote(prev => ({ ...prev, note: e.target.value }))}
              placeholder="How was your day? Any insights, symptoms, or observations..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={6}
            />
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
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}
