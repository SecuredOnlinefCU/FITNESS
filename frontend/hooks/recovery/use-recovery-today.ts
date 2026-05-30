'use client';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { recoveryApi } from '@/lib/api/modules/recovery';
export function useRecoveryToday() { return useAsyncData(() => recoveryApi.today(), []); }
