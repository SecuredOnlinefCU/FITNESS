'use client';

import { useCallback, useId } from 'react';
import { motion } from 'framer-motion';

type Props = {
  values: { value: number; recordedAt?: string }[];
  width?: number;
  height?: number;
  accentColor?: string;
};

export function MetricSparkline({ values, width = 120, height = 32, accentColor = 'var(--primary)' }: Props) {
  const clipId = useId();
  const sorted = [...values].sort((a, b) => new Date(a.recordedAt ?? 0).getTime() - new Date(b.recordedAt ?? 0).getTime());
  const nums = sorted.map(v => v.value);
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = max - min || 1;

  const toPoint = useCallback(
    (i: number, val: number) => {
      const x = nums.length > 1 ? (i / (nums.length - 1)) * width : width / 2;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    },
    [nums.length, width, height, min, range],
  );

  if (nums.length < 2) {
    return <div className="flex items-center justify-center text-[10px] text-muted-foreground" style={{ width, height }}>No trend</div>;
  }

  const points = nums.map((v, i) => toPoint(i, v)).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${clipId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill={`url(#grad-${clipId})`} points={`0,${height} ${points} ${width},${height}`} />
      <motion.polyline
        fill="none"
        stroke={accentColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <motion.circle
        cx={nums.length > 1 ? ((nums.length - 1) / (nums.length - 1)) * width : width / 2}
        cy={toPoint(nums.length - 1, nums[nums.length - 1]).split(',')[1]}
        r="2.5"
        fill={accentColor}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      />
    </svg>
  );
}
