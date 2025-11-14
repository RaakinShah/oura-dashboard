import { useEffect, useRef, useCallback } from 'react';

export interface KeyboardNavigationOptions {
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  onSelect?: (index: number) => void;
}

/**
 * Hook for keyboard navigation in lists and menus
 */
export function useKeyboardNavigation(
  itemCount: number,
  options: KeyboardNavigationOptions = {}
) {
  const { orientation = 'vertical', loop = true, onSelect } = options;
  const currentIndexRef = useRef(0);

  const getNextIndex = useCallback(
    (current: number, direction: 'up' | 'down' | 'left' | 'right'): number => {
      const isVertical = orientation === 'vertical' || orientation === 'both';
      const isHorizontal = orientation === 'horizontal' || orientation === 'both';

      let next = current;

      if ((direction === 'up' && isVertical) || (direction === 'left' && isHorizontal)) {
        next = current - 1;
        if (next < 0) {
          next = loop ? itemCount - 1 : 0;
        }
      } else if ((direction === 'down' && isVertical) || (direction === 'right' && isHorizontal)) {
        next = current + 1;
        if (next >= itemCount) {
          next = loop ? 0 : itemCount - 1;
        }
      }

      return next;
    },
    [itemCount, orientation, loop]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      let handled = false;
      const current = currentIndexRef.current;

      switch (event.key) {
        case 'ArrowUp':
          currentIndexRef.current = getNextIndex(current, 'up');
          handled = true;
          break;
        case 'ArrowDown':
          currentIndexRef.current = getNextIndex(current, 'down');
          handled = true;
          break;
        case 'ArrowLeft':
          currentIndexRef.current = getNextIndex(current, 'left');
          handled = true;
          break;
        case 'ArrowRight':
          currentIndexRef.current = getNextIndex(current, 'right');
          handled = true;
          break;
        case 'Home':
          currentIndexRef.current = 0;
          handled = true;
          break;
        case 'End':
          currentIndexRef.current = itemCount - 1;
          handled = true;
          break;
        case 'Enter':
        case ' ':
          if (onSelect) {
            onSelect(currentIndexRef.current);
            handled = true;
          }
          break;
      }

      if (handled) {
        event.preventDefault();
      }
    },
    [itemCount, getNextIndex, onSelect]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    currentIndex: currentIndexRef.current,
    setCurrentIndex: (index: number) => {
      currentIndexRef.current = Math.max(0, Math.min(index, itemCount - 1));
    },
  };
}

/**
 * Hook for roving tabindex (accessible widget navigation)
 */
export function useRovingTabIndex(itemCount: number) {
  const currentIndexRef = useRef(0);

  const getTabIndex = useCallback(
    (index: number): number => {
      return index === currentIndexRef.current ? 0 : -1;
    },
    []
  );

  const setCurrentIndex = useCallback((index: number) => {
    currentIndexRef.current = index;
  }, []);

  return { getTabIndex, setCurrentIndex, currentIndex: currentIndexRef.current };
}

/**
 * Hook for detecting keyboard vs mouse user
 */
export function useFocusVisible() {
  const isKeyboardUserRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = () => {
      isKeyboardUserRef.current = true;
      document.body.classList.add('keyboard-user');
    };

    const handleMouseDown = () => {
      isKeyboardUserRef.current = false;
      document.body.classList.remove('keyboard-user');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return isKeyboardUserRef.current;
}
