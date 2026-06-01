
import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ 
  className, 
  variant = 'default',
  interactive = false,
  ...props 
}: React.HTMLAttributes<HTMLDivElement> & { 
  variant?: 'default' | 'elevated' | 'outline' | 'accent';
  interactive?: boolean;
}) {
  // Base styles
  const baseStyles = 'rounded-2xl border transition-all duration-200 ease-out-back';
  
  // Variant styles
  const variants = {
    default: 'bg-card border-border',
    elevated: 'bg-card border-border shadow-sm hover:shadow-lg active:shadow-xl',
    outline: 'bg-transparent border-border hover:bg-muted/5 active:bg-muted/10',
    accent: 'bg-accent/5 border-accent/20 hover:bg-accent/10 active:bg-accent/15',
  }[variant];
  
  // Interactive styles
  const interactiveStyles = interactive 
    ? 'hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/20'
    : '';
  
  // Depth enhancement
  const depthStyles = 'overflow-hidden';
  
  return (
    <div 
      className={cn(
        baseStyles,
        variants,
        interactiveStyles,
        depthStyles,
        className
      )}
      {...props} 
    >
    </div>
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { 
  return <div className={cn('p-5', className)} {...props} />; 
}

// Card header and footer components for more structured cards
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { 
  return <div className={cn('pb-4 pt-5 border-b border-inherit', className)} {...props} />; 
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { 
  return <div className={cn('pt-4 pb-5 border-t border-inherit', className)} {...props} />; 
}

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-lg font-semibold text-foreground mb-2', className)} {...props} />
);

export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props} />
);

