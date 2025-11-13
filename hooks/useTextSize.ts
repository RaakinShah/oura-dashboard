import { useState, useEffect } from 'react';

export type TextSize = 'small' | 'medium' | 'large' | 'x-large';

const STORAGE_KEY = 'preferred-text-size';

const textSizeMap: Record<TextSize, string> = {
  small: '87.5%',
  medium: '100%',
  large: '112.5%',
  'x-large': '125%',
};

/**
 * Hook for managing user text size preference
 */
export function useTextSize() {
  const [textSize, setTextSize] = useState<TextSize>('medium');

  useEffect(() => {
    // Load saved preference
    const saved = localStorage.getItem(STORAGE_KEY) as TextSize;
    if (saved && textSizeMap[saved]) {
      setTextSize(saved);
      applyTextSize(saved);
    }
  }, []);

  const applyTextSize = (size: TextSize) => {
    document.documentElement.style.fontSize = textSizeMap[size];
  };

  const changeTextSize = (size: TextSize) => {
    setTextSize(size);
    applyTextSize(size);
    localStorage.setItem(STORAGE_KEY, size);
  };

  const increaseTextSize = () => {
    const sizes: TextSize[] = ['small', 'medium', 'large', 'x-large'];
    const currentIndex = sizes.indexOf(textSize);
    if (currentIndex < sizes.length - 1) {
      changeTextSize(sizes[currentIndex + 1]);
    }
  };

  const decreaseTextSize = () => {
    const sizes: TextSize[] = ['small', 'medium', 'large', 'x-large'];
    const currentIndex = sizes.indexOf(textSize);
    if (currentIndex > 0) {
      changeTextSize(sizes[currentIndex - 1]);
    }
  };

  const resetTextSize = () => {
    changeTextSize('medium');
  };

  return {
    textSize,
    setTextSize: changeTextSize,
    increaseTextSize,
    decreaseTextSize,
    resetTextSize,
  };
}
