import * as React from 'react';
import { cn } from '@/lib/utils';
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={cn('h-11 w-full rounded-2xl border border-border bg-card px-4 text-sm outline-none transition placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20', props.className)} />; }
