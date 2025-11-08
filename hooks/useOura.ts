'use client';

import { useState, useEffect } from 'react';
import { OuraAPIClient, SleepData, ActivityData, ReadinessData } from '@/lib/oura-api';
import { storage } from '@/lib/storage';
import { mockSleepData, mockActivityData, mockReadinessData } from '@/lib/mock-data';

export function useOuraData() {
  console.log('useOuraData hook called');
  const [sleep, setSleep] = useState<SleepData[]>([]);
  const [activity, setActivity] = useState<ActivityData[]>([]);
  const [readiness, setReadiness] = useState<ReadinessData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    console.log('useOuraData useEffect running');
    const token = storage.getToken();
    console.log('Token from storage:', token ? 'Found' : 'Not found');
    setHasToken(!!token);

    if (!token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        console.log('Starting to fetch data...');
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

        console.log('Date range:', startDate, 'to', endDate);

        // Clear any cached data before fetching
        storage.clearCache();

        console.log('Fetching from API...');
        const [sleepResponse, activityResponse, readinessResponse] = await Promise.all([
          client.getSleep(startDate, endDate),
          client.getActivity(startDate, endDate),
          client.getReadiness(startDate, endDate),
        ]);

        console.log('API responses:', {
          sleep: sleepResponse.data.length,
          activity: activityResponse.data.length,
          readiness: readinessResponse.data.length
        });

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

        console.log('Valid data:', {
          sleep: validSleep.length,
          activity: validActivity.length,
          readiness: validReadiness.length
        });

        setSleep(validSleep);
        setActivity(validActivity);
        setReadiness(validReadiness);
        console.log('Data set successfully, setting loading to false');
      } catch (err) {
        console.error('Error fetching Oura data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        console.log('Finally block - setting loading to false');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refetch = () => {
    setLoading(true);
    // Trigger re-fetch by updating a dependency
    window.location.reload();
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
