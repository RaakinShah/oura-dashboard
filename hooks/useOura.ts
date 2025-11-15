'use client';

import { useState, useEffect } from 'react';
import { OuraAPIClient, SleepData, ActivityData, ReadinessData } from '@/lib/oura-api';
import { storage } from '@/lib/storage';

export function useOuraData() {
  const [sleep, setSleep] = useState<SleepData[]>([]);
  const [activity, setActivity] = useState<ActivityData[]>([]);
  const [readiness, setReadiness] = useState<ReadinessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    const token = storage.getToken();
    setHasToken(!!token);

    if (!token) {
      setLoading(false);
      return;
    }

    // Create AbortController to cancel requests on unmount or re-fetch
    const abortController = new AbortController();
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const client = new OuraAPIClient({ accessToken: token });

        // Fetch last 30 days of data
        // Add 1 day to endDate to ensure we catch the most recent sleep data
        // (Oura data for "last night" might be associated with today's date)
        const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];

        // Clear any cached data before fetching
        storage.clearCache();

        const [sleepResponse, activityResponse, readinessResponse] = await Promise.all([
          client.getSleep(startDate, endDate),
          client.getActivity(startDate, endDate),
          client.getReadiness(startDate, endDate),
        ]);

        // Only update state if component is still mounted (prevents memory leak)
        if (!isMounted || abortController.signal.aborted) {
          return;
        }

        // Filter out days with no actual data (score must exist and be valid)
        // Keep days even if some secondary metrics are 0
        const validSleep = sleepResponse.data.filter(s =>
          s.score != null &&
          s.score > 0 &&
          !isNaN(s.score)
        );

        const validActivity = activityResponse.data.filter(a =>
          a.score != null &&
          a.score > 0 &&
          !isNaN(a.score)
        );

        const validReadiness = readinessResponse.data.filter(r =>
          r.score != null &&
          r.score > 0 &&
          !isNaN(r.score)
        );

        setSleep(validSleep);
        setActivity(validActivity);
        setReadiness(validReadiness);
      } catch (err) {
        // Only set error if component is still mounted
        if (isMounted && !abortController.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch data');
        }
      } finally {
        // Only update loading if component is still mounted
        if (isMounted && !abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to prevent memory leaks and race conditions
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [refetchTrigger]);

  const refetch = () => {
    // Trigger re-fetch by incrementing the trigger
    setRefetchTrigger(prev => prev + 1);
  };

  return {
    sleep,
    activity,
    readiness,
    loading,
    error,
    hasToken,
    refetch,
  };
}

export function useOuraToken() {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    setTokenState(storage.getToken());
  }, []);

  const setToken = (newToken: string) => {
    storage.setToken(newToken);
    setTokenState(newToken);
  };

  const removeToken = () => {
    storage.removeToken();
    setTokenState(null);
  };

  return {
    token,
    setToken,
    removeToken,
    hasToken: !!token,
  };
}
