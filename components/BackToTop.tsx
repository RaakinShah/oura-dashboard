'use client';

import { ArrowUp } from 'lucide-react';
import { useScrollThreshold } from '@/hooks/useScrollPosition';

export function BackToTop() {
  const isVisible = useScrollThreshold(300);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="
        fixed bottom-8 right-8 z-40
        w-12 h-12
        rounded-full
        bg-stone-900 text-white
        shadow-lg
        hover:bg-sage-800
        hover:scale-110
        active:scale-95
        transition-all duration-300
        animate-scale-in
        flex items-center justify-center
      "
      aria-label="Scroll to top"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
