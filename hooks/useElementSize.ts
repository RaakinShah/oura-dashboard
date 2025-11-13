import { RefObject, useState, useEffect } from 'react';

export interface ElementSize {
  width: number;
  height: number;
}

export function useElementSize<T extends HTMLElement = HTMLDivElement>(
  elementRef: RefObject<T>
): ElementSize {
  const [size, setSize] = useState<ElementSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      if (!Array.isArray(entries) || !entries.length) return;

      const entry = entries[0];
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef]);

  return size;
}
