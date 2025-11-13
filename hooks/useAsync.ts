import { useState, useEffect, useCallback } from 'react';

export interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: immediate,
  });

  const execute = useCallback(async () => {
    setState({ data: null, error: null, loading: true });

    try {
      const response = await asyncFunction();
      setState({ data: response, error: null, loading: false });
      return response;
    } catch (error) {
      setState({ data: null, error: error as Error, loading: false });
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
}
