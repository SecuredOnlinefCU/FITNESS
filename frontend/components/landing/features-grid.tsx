'use client';

import { motion } from 'framer-motion';
import { Dumbbell, Apple, Target, Trophy, BarChart3, MessageCircle, Users, Zap } from 'lucide-react';

const features = [
  { icon: Dumbbell, title: 'Workout builder', desc: 'Create and assign custom workout programs in minutes with AI assistance.' },
  { icon: Apple, title: 'Nutrition coaching', desc: 'Build meal plans, track macros, and guide clients toward better habits.' },
  { icon: Target, title: 'Habit tracking', desc: 'Design daily routines that drive lasting behavioral change.' },
  { icon: Trophy, title: 'Progress tracking', desc: 'Track client progress with clear, objective data and insights.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Understand client performance with actionable metrics and reports.' },
  { icon: MessageCircle, title: 'Client messaging', desc: 'Stay connected with 1-1 messaging, voice notes, and broadcast.' },
  { icon: Users, title: 'Community', desc: 'Foster engagement with group challenges and community features.' },
  { icon: Zap, title: 'Automation', desc: 'Automate check-ins, reminders, and onboarding workflows.' },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-signal">Features</span>
          <h2 className="font-display text-3xl font-bold mt-3 md:text-4xl tracking-tight">Everything you need to coach at scale</h2>
          <p className="mt-4 text-bone-mute">Fifteen powerful features designed to help you deliver a world-class coaching experience.</p>
        </motion.div>

        <div className="grid gap-px bg-line overflow-hidden rounded-2xl border border-line md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              className="bg-ink-950 p-6 hover:bg-ink-900 transition-colors"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-ink-800">
                <f.icon className="h-5 w-5 text-signal" />
              </div>
              <h3 className="text-sm font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-bone-fade leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
