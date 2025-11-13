'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function LoadingBar() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);
    setProgress(0);

    // Simulate progress
    const intervals = [
      setTimeout(() => setProgress(30), 100),
      setTimeout(() => setProgress(60), 300),
      setTimeout(() => setProgress(90), 600),
      setTimeout(() => {
        setProgress(100);
        setTimeout(() => setIsLoading(false), 200);
      }, 800),
    ];

    return () => intervals.forEach(clearTimeout);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-[9999] bg-stone-200"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div
        className="h-full bg-gradient-to-r from-sage-500 to-sage-600 transition-all duration-300 ease-out shadow-lg"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
