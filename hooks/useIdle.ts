import { useState, useEffect } from 'react';

export function useIdle(timeoutMs: number = 60000): boolean {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleActivity = () => {
      setIsIdle(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsIdle(true), timeoutMs);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    timeoutId = setTimeout(() => setIsIdle(true), timeoutMs);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearTimeout(timeoutId);
    };
  }, [timeoutMs]);

  return isIdle;
}
