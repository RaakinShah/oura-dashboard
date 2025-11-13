'use client';

import { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { trapFocus } from '@/lib/utils/focusManagement';

interface Shortcut {
  keys: string;
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { keys: 'H', description: 'Go to Dashboard', category: 'Navigation' },
  { keys: 'I', description: 'Go to Insights', category: 'Navigation' },
  { keys: 'S', description: 'Go to Sleep', category: 'Navigation' },
  { keys: 'A', description: 'Go to Activity', category: 'Navigation' },
  { keys: 'R', description: 'Go to Readiness', category: 'Navigation' },
  { keys: ',', description: 'Go to Settings', category: 'Navigation' },
  { keys: '⌘ + R', description: 'Refresh Data', category: 'Actions' },
  { keys: '?', description: 'Show Keyboard Shortcuts', category: 'Help' },
  { keys: 'Esc', description: 'Close Modal', category: 'Help' },
];

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const modalElement = document.querySelector('[role="dialog"]') as HTMLElement;
      if (modalElement) {
        const cleanup = trapFocus(modalElement);
        return cleanup;
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sage-100 flex items-center justify-center">
              <Keyboard className="h-5 w-5 text-sage-700" />
            </div>
            <h2 id="shortcuts-title" className="text-2xl font-light">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors"
            aria-label="Close shortcuts modal"
          >
            <X className="h-5 w-5 text-stone-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          {categories.map((category) => (
            <div key={category} className="mb-8 last:mb-0">
              <h3 className="text-sm uppercase tracking-wider font-medium text-stone-500 mb-4">
                {category}
              </h3>
              <div className="space-y-3">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-4 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <span className="text-stone-700">{shortcut.description}</span>
                      <kbd className="px-3 py-1.5 bg-stone-100 border border-stone-300 rounded-md text-sm font-mono text-stone-700 shadow-sm">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-stone-200 bg-stone-50">
          <p className="text-sm text-stone-600 text-center">
            Press <kbd className="px-2 py-1 bg-white border border-stone-300 rounded text-xs font-mono">?</kbd> to toggle this menu
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to manage keyboard shortcuts modal
 */
export function useKeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?' && e.shiftKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
