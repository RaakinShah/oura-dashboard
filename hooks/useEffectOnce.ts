import { useEffect } from 'react';

export function useEffectOnce(effect: () => void | (() => void)) {
  useEffect(effect, []);
}
