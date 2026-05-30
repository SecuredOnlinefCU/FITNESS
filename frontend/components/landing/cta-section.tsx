'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-signal/15 via-ink-950 to-flow/15" />
      <div className="absolute inset-0 bg-grid-white opacity-30" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold md:text-5xl tracking-tight mb-6">
            Start your 30-day free trial
          </h2>
          <p className="text-lg text-bone-mute mb-10 max-w-lg mx-auto">
            No credit card required. Unlimited clients. Cancel anytime.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-signal px-8 py-3 text-sm font-medium text-ink-950 hover:brightness-95 transition-all"
          >
            Get started free
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
