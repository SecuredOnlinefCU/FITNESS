'use client';

'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const logos = ["Gold's Gym", 'Life Time', 'YMCA', 'Burn Boot Camp', 'Nike Training', 'CrossFit'];

export default function TrustBar() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const animDuration = reduced ? 0.01 : 30;

  return (
    <section className="border-y border-line py-12 overflow-hidden">
      <p className="text-center text-xs font-medium uppercase tracking-widest text-bone-fade mb-8">
        Trusted by leading fitness brands
      </p>
      <div className="relative">
        <motion.div
          className="flex gap-20"
          animate={reduced ? {} : { x: ['0%', '-50%'] }}
          transition={{ duration: animDuration, ease: 'linear', repeat: Infinity }}
        >
          {[...logos, ...logos].map((logo, i) => (
            <span
              key={`${logo}-${i}`}
              className="text-sm font-bold tracking-wide text-bone-fade uppercase whitespace-nowrap"
            >
              {logo}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
