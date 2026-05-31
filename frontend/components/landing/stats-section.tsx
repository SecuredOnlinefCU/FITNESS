'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const stats = [
  { value: 200, suffix: 'K+', label: 'Fitness coaches' },
  { value: 170, suffix: '+', label: 'Countries worldwide' },
  { value: 3, suffix: 'M+', label: 'Clients onboarded' },
  { value: 98, suffix: '%', label: 'Client retention rate' },
];

function AnimatedStat({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      className="text-center"
    >
      <div className="font-display text-3xl font-bold text-signal md:text-4xl">
        {inView ? <CountUp to={value} /> : 0}{suffix}
      </div>
      <div className="text-sm text-bone-fade mt-1">{label}</div>
    </motion.div>
  );
}

function CountUp({ to }: { to: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return <span ref={ref}>{inView ? to : 0}</span>;
}

export default function StatsSection() {
  return (
    <section className="py-16 border-b border-line">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <AnimatedStat key={s.label} value={s.value} suffix={s.suffix} label={s.label} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
}
