'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

type RestTimerProps = {
  duration: number;
  onComplete: () => void;
  onSkip: () => void;
};

export function RestTimer({ duration, onComplete, onSkip }: RestTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, remaining, onComplete]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = 1 - remaining / duration;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress);

  const adjust = useCallback((delta: number) => {
    setRemaining(prev => Math.max(0, prev + delta));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/95 backdrop-blur-sm"
    >
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-8">Rest</p>

      <div className="relative w-36 h-36 mb-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/20" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="4"
            className="text-primary"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transition={{ duration: 0.5 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-black tabular-nums">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={() => adjust(-15)} className="rounded-xl bg-muted px-4 py-3 text-sm font-bold text-foreground hover:bg-muted/80 transition">
          -15s
        </button>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="rounded-full bg-primary p-4 text-primary-foreground hover:bg-primary/90 transition"
        >
          {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
        </button>
        <button onClick={() => adjust(15)} className="rounded-xl bg-muted px-4 py-3 text-sm font-bold text-foreground hover:bg-muted/80 transition">
          +15s
        </button>
      </div>

      <button
        onClick={onSkip}
        className="mt-8 flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition"
      >
        Skip rest <SkipForward className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
