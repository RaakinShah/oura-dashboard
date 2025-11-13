import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
}

/**
 * Hook for registering keyboard shortcuts
 * Provides power user features and better accessibility
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey;
      const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatches = shortcut.alt ? event.altKey : !event.altKey;
      const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Predefined shortcuts for common dashboard actions
 */
export function useDashboardShortcuts() {
  const router = useRouter();

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'h',
      description: 'Go to Dashboard',
      action: () => router.push('/'),
    },
    {
      key: 'i',
      description: 'Go to Insights',
      action: () => router.push('/insights'),
    },
    {
      key: 's',
      description: 'Go to Sleep',
      action: () => router.push('/sleep'),
    },
    {
      key: 'a',
      description: 'Go to Activity',
      action: () => router.push('/activity'),
    },
    {
      key: 'r',
      description: 'Go to Readiness',
      action: () => router.push('/readiness'),
    },
    {
      key: ',',
      description: 'Go to Settings',
      action: () => router.push('/settings'),
    },
    {
      key: 'r',
      ctrl: true,
      description: 'Refresh Data',
      action: () => window.location.reload(),
    },
    {
      key: '?',
      shift: true,
      description: 'Show Keyboard Shortcuts',
      action: () => {
        // Could open a modal with shortcuts
        console.log('Keyboard shortcuts:', shortcuts);
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}

/**
 * Format shortcut key combination for display
 */
export function formatShortcut(shortcut: ShortcutConfig): string {
  const parts: string[] = [];

  if (shortcut.ctrl || shortcut.meta) parts.push('⌘');
  if (shortcut.shift) parts.push('⇧');
  if (shortcut.alt) parts.push('⌥');
  parts.push(shortcut.key.toUpperCase());

  return parts.join(' + ');
}
