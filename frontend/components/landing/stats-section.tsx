'use client';

import { motion } from 'framer-motion';

const stats = [
  { value: '200K+', label: 'Fitness coaches' },
  { value: '170+', label: 'Countries worldwide' },
  { value: '3M+', label: 'Clients onboarded' },
  { value: '98%', label: 'Client retention rate' },
];

export default function StatsSection() {
  return (
    <section className="py-16 border-b border-line">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-signal md:text-4xl">{s.value}</div>
              <div className="text-sm text-bone-fade mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
