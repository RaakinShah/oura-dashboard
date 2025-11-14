import { useEffect, useLayoutEffect } from 'react';

// Use useLayoutEffect on client, useEffect on server (SSR-safe)
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
