import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Custom focus ring component that provides brand-matched focus indicators.
 * Use this instead of default browser focus outlines for a cohesive brand experience.
 */
export function FocusRing({ 
  className, 
  color = 'primary',
  offset = 2,
  thickness = 2,
  children,
  ...props 
}: { 
  className?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'subtle';
  offset?: number;
  thickness?: number;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const colorMap = {
    primary: 'var(--primary)',
    secondary: 'var(--secondary)',
    accent: 'var(--accent)',
    subtle: 'var(--bone-fade)',
  };
  
  return (
    <div className="relative">
      <div
        className={cn(
          'absolute rounded-inherit',
          'pointer-events-none',
          'opacity-0 transition-opacity duration-200',
          'group-focus-within:opacity-100',
          className
        )}
        style={{
          top: -offset,
          left: -offset,
          right: -offset,
          bottom: -offset,
          border: `${thickness}px solid ${colorMap[color]}`,
          borderRadius: 'inherit',
        }}
      />
      <div className="group">{children}</div>
    </div>
  );
}
