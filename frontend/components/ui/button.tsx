
import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
};

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  ...props 
}: ButtonProps) {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  
  // Size variations
  const sizeStyles = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-11 px-5 text-lg',
    xl: 'h-12 px-6 text-xl',
  }[size];
  
  // Width variation
  const widthStyle = fullWidth ? 'w-full' : '';
  
  // Variant styles
  const variants = {
    primary: {
      bg: 'bg-primary text-primary-foreground',
      hover: 'hover:bg-primary/90',
      active: 'active:bg-primary/80',
      focus: 'focus-visible:ring-primary/20',
      disabled: 'disabled:opacity-50 disabled:hover:bg-primary',
    },
    secondary: {
      bg: 'bg-secondary text-secondary-foreground',
      hover: 'hover:bg-secondary/90',
      active: 'active:bg-secondary/80',
      focus: 'focus-visible:ring-secondary/20',
      disabled: 'disabled:opacity-50 disabled:hover:bg-secondary',
    },
    ghost: {
      bg: 'bg-transparent text-foreground',
      hover: 'hover:bg-muted/20',
      active: 'active:bg-muted/30',
      focus: 'focus-visible:ring-muted/20',
      disabled: 'disabled:opacity-50 disabled:hover:bg-transparent',
    },
    outline: {
      bg: 'bg-transparent text-primary-foreground border border-primary/30',
      hover: 'hover:bg-primary/5 hover:text-primary-foreground',
      active: 'active:bg-primary/10',
      focus: 'focus-visible:ring-primary/20',
      disabled: 'disabled:opacity-50 disabled:border-none disabled:text-muted-foreground',
    },
    danger: {
      bg: 'bg-destructive text-destructive-foreground',
      hover: 'hover:bg-destructive/90',
      active: 'active:bg-destructive/80',
      focus: 'focus-visible:ring-destructive/20',
      disabled: 'disabled:opacity-50 disabled:hover:bg-destructive',
    },
  }[variant];
  
  // Depth and motion enhancements
  const depthStyles = 'shadow-sm hover:shadow-md active:shadow-lg focus-visible:shadow-none transition-shadow duration-200';
  const motionStyles = 'duration-200 ease-out-back';
  
  return (
    <button 
      className={cn(
        baseStyles,
        sizeStyles,
        widthStyle,
        variants.bg,
        variants.hover,
        variants.active,
        variants.focus,
        variants.disabled,
        depthStyles,
        motionStyles,
        className
      )}
      {...props} 
    >
      {props.children}
    </button>
  );
}

