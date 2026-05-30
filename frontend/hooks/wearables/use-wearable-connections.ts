'use client';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { wearablesApi } from '@/lib/api/modules/wearables';
export function useWearableConnections() { return useAsyncData(() => wearablesApi.connections(), []); }
