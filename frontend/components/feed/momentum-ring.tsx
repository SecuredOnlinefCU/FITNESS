'use client';

import { motion } from 'framer-motion';
import type { MomentumData } from '@/lib/types/domain';

export function MomentumRing({ data }: { data: MomentumData }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(data.score / 100, 1);
  const trendColor = data.trend === 'up' ? 'var(--energy)' : data.trend === 'down' ? 'var(--pulse)' : 'var(--muted-foreground)';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        <svg width="128" height="128" className="-rotate-90">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--line)" strokeWidth="8" />
          <motion.circle
            cx="64" cy="64" r={radius} fill="none" stroke="var(--signal)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - progress) }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <span className="absolute text-2xl font-black text-foreground">{data.score}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 w-full">
        {(data.components ?? []).map(c => (
          <div key={c.label} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-xs">
            <span className="text-muted-foreground">{c.label}</span>
            <span className="font-bold text-foreground">{c.value}/{c.max}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground" style={{ color: trendColor }}>
        {data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→'} {data.change > 0 ? '+' : ''}{data.change} this week
      </p>
    </div>
  );
}
