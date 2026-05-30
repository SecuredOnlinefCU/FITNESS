'use client';

import { useEffect } from 'react';
import { useAsyncData } from './use-async-data';

export function usePollingData<T>(loader: () => Promise<T>, intervalMs = 15000, deps: React.DependencyList = []) {
  const result = useAsyncData(loader, deps);

  useEffect(() => {
    const timer = window.setInterval(() => {
      result.reload();
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs, result.reload]);

  return result;
}
