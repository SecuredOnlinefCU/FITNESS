'use client';

import { useCallback, useEffect, useState } from 'react';
import type { LoadResult, LoadStatus } from '@/lib/state/result';

export function useAsyncData<T>(loader: () => Promise<T>, deps: React.DependencyList = []): LoadResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setStatus((current) => (current === 'success' ? 'success' : 'loading'));
    setError(null);
    try {
      const result = await loader();
      setData(result);
      setStatus('success');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
      setStatus('error');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    data,
    status,
    error,
    loading: status === 'loading' || status === 'idle',
    reload,
  };
}
