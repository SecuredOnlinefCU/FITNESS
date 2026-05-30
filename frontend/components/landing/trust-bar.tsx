'use client';

import { motion } from 'framer-motion';

const logos = ["Gold's Gym", 'Life Time', 'YMCA', 'Burn Boot Camp', 'Nike Training', 'CrossFit'];

export default function TrustBar() {
  return (
    <section className="border-y border-line py-12 overflow-hidden">
      <p className="text-center text-xs font-medium uppercase tracking-widest text-bone-fade mb-8">
        Trusted by leading fitness brands
      </p>
      <div className="relative">
        <motion.div
          className="flex gap-20"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
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
