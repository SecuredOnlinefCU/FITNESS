import * as React from 'react';
import { cn } from '@/lib/utils';
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} className={cn('h-11 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none transition focus:ring-2 focus:ring-primary/20', props.className)} />; }
