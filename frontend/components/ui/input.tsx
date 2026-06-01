import * as React from 'react';
import { cn } from '@/lib/utils';

export function Input({
  className,
  type = 'text',
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      {icon && (
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </div>
      )}
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-border bg-card px-4 py-2 text-sm transition-all duration-200 ease-out-back',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'shadow-sm hover:shadow-md',
          icon && 'pl-10',
          className
        )}
        {...props}
      />
    </div>
  );
}

export function Textarea({ className, rows = 4, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={cn(
        'flex min-h-[80px] w-full rounded-lg border border-border bg-card px-4 py-2 text-sm transition-all duration-200 ease-out-back',
        'placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'shadow-sm hover:shadow-md',
        className
      )}
      {...props}
    />
  );
}
