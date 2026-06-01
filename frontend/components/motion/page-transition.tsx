'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type PageTransitionProps = {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
};

export function PageTransition({
  children,
  className = '',
  staggerDelay = 0.05,
  duration = 0.5,
  direction = 'up',
}: PageTransitionProps) {
  const offsetMap = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { x: 30, y: 0 },
    right: { x: -30, y: 0 },
    fade: { x: 0, y: 0 },
  };

  const offset = offsetMap[direction] ?? offsetMap.up;
  const isFade = direction === 'fade';

  return (
    <motion.div
      initial={isFade ? { opacity: 0 } : { opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={isFade ? { opacity: 0 } : { opacity: 0, ...offset }}
      transition={{
        duration,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={cn('', className)}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className = '',
  delay = 0,
  staggerChildren = 0.05,
  duration = 0.4,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerChildren?: number;
  duration?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '', duration = 0.4 }: { children: ReactNode; className?: string; duration?: number }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration,
            ease: [0.25, 0.1, 0.25, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
