'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ArrowRight } from 'lucide-react';
import { levelFitnessBrand } from '@/lib/brand/levelfitness';

const HologramCanvas = dynamic(() => import('@/components/3d/hologram-canvas'), { ssr: false });

const phrases = levelFitnessBrand.taglines;

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % phrases.length), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <HologramCanvas />
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_30%,rgba(215,255,47,0.08),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_20%_30%,rgba(56,189,248,0.08),transparent_55%)]" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/80 to-transparent" />

      <Image
        src="/images/coach-hero.png"
        alt=""
        fill
        className="object-cover object-right opacity-40 md:opacity-60"
        sizes="100vw"
        priority
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-ink-900/50 px-4 py-1.5 text-xs text-bone-mute mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-signal animate-pulse" />
              AI-powered coaching platform
            </div>

            <h1 className="text-5xl font-bold tracking-tight md:text-7xl leading-[1.05]">
              Level up your fitness,{' '}
              <span className="relative inline-block min-w-[4ch]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={phrases[index]}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="text-transparent bg-clip-text bg-gradient-to-r from-signal via-energy to-flow"
                  >
                    {phrases[index]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            <p className="mt-6 text-lg text-bone-mute max-w-lg leading-relaxed">
              Programs, messaging, workouts, nutrition, payments — everything you need to coach, scale, and win.
            </p>

            <div className="mt-10 flex gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-signal px-6 py-3 text-sm font-medium text-ink-950 hover:brightness-95 transition-all"
              >
                Start free trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center gap-2 rounded-lg border border-line px-6 py-3 text-sm font-medium text-bone-mute hover:bg-ink-900 transition-colors"
              >
                See how it works
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
