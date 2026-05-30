import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' };
export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:brightness-95',
    secondary: 'bg-muted text-foreground hover:bg-ink-800',
    ghost: 'bg-transparent text-foreground hover:bg-ink-800',
    danger: 'bg-destructive text-destructive-foreground hover:brightness-90',
  };
  return <button className={cn('inline-flex h-11 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50', variants[variant], className)} {...props} />;
}
