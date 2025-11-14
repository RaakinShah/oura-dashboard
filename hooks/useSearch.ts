import { useState, useMemo } from 'react';
import { debounce } from '@/lib/utils/performance';

interface UseSearchOptions<T> {
  keys: (keyof T)[];
  debounceMs?: number;
  caseSensitive?: boolean;
}

/**
 * Hook for searching through data
 */
export function useSearch<T>(data: T[], options: UseSearchOptions<T>) {
  const { keys, debounceMs = 300, caseSensitive = false } = options;
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounced query update
  const debouncedSetQuery = useMemo(
    () => debounce((value: string) => setDebouncedQuery(value), debounceMs),
    [debounceMs]
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    debouncedSetQuery(value);
  };

  // Filter data based on query
  const filteredData = useMemo(() => {
    if (!debouncedQuery.trim()) return data;

    const searchTerm = caseSensitive
      ? debouncedQuery.trim()
      : debouncedQuery.trim().toLowerCase();

    return data.filter((item) => {
      return keys.some((key) => {
        const value = String(item[key]);
        const searchValue = caseSensitive ? value : value.toLowerCase();
        return searchValue.includes(searchTerm);
      });
    });
  }, [data, debouncedQuery, keys, caseSensitive]);

  return {
    query,
    setQuery: handleQueryChange,
    filteredData,
    isSearching: query !== debouncedQuery,
    hasResults: filteredData.length > 0,
    resultCount: filteredData.length,
  };
}

/**
 * Hook for fuzzy search
 */
export function useFuzzySearch<T>(data: T[], searchKey: keyof T) {
  const [query, setQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!query.trim()) return data;

    const searchTerm = query.toLowerCase();

    return data
      .map((item) => {
        const value = String(item[searchKey]).toLowerCase();
        const score = fuzzyMatch(value, searchTerm);
        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }, [data, query, searchKey]);

  return {
    query,
    setQuery,
    filteredData,
    hasResults: filteredData.length > 0,
    resultCount: filteredData.length,
  };
}

/**
 * Simple fuzzy matching algorithm
 */
function fuzzyMatch(str: string, pattern: string): number {
  let score = 0;
  let patternIdx = 0;
  let strIdx = 0;

  while (strIdx < str.length && patternIdx < pattern.length) {
    if (str[strIdx] === pattern[patternIdx]) {
      score += 1;
      patternIdx += 1;
    }
    strIdx += 1;
  }

  return patternIdx === pattern.length ? score / str.length : 0;
}
