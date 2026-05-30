'use client';

import { motion } from 'framer-motion';

const logos = ["Gold's Gym", 'Life Time', 'YMCA', 'Burn Boot Camp', 'Nike Training', 'CrossFit'];

export default function TrustBar() {
  return (
    <section className="border-y border-line py-12">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-bone-fade mb-8">
          Trusted by leading fitness brands
        </p>
        <div className="flex flex-wrap justify-center gap-x-14 gap-y-6">
          {logos.map((logo, i) => (
            <motion.div
              key={logo}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <span className="text-sm font-bold tracking-wide text-bone-fade uppercase">{logo}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
