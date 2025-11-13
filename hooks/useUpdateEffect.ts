import { useEffect, useRef, EffectCallback, DependencyList } from 'react';

export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList) {
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    return effect();
  }, deps);
}
