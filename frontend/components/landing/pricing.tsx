'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: '$29',
    desc: 'For solo coaches',
    features: ['Up to 20 clients', 'Workout programming', 'Basic analytics', 'Email support'],
  },
  {
    name: 'Pro',
    price: '$79',
    desc: 'For growing businesses',
    popular: true,
    features: ['Unlimited clients', 'AI workout builder', 'Nutrition planning', 'Advanced analytics', 'Priority support'],
  },
  {
    name: 'Enterprise',
    price: '$199',
    desc: 'For organizations',
    features: ['White-label app', 'Custom integrations', 'Dedicated account manager', 'API access', 'SLA guarantee'],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-signal">Pricing</span>
          <h2 className="text-3xl font-bold mt-3 md:text-4xl tracking-tight">Simple, transparent pricing</h2>
          <p className="mt-4 text-bone-mute">Start free. Upgrade when you grow. No hidden fees or surprise charges.</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative rounded-2xl border p-6 ${
                plan.popular
                  ? 'border-signal/50 bg-ink-900 shadow-lg shadow-signal/5'
                  : 'border-line bg-ink-950'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-6 rounded-full bg-signal px-3 py-0.5 text-xs font-semibold text-ink-950">
                  Popular
                </span>
              )}

              <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
              <p className="text-sm text-bone-fade mb-4">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-sm text-bone-fade">/month</span>
              </div>

              <Link
                href="/signup"
                className={`block w-full text-center rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  plan.popular
                    ? 'bg-signal text-ink-950 hover:brightness-95'
                    : 'border border-line text-bone-mute hover:bg-ink-900'
                }`}
              >
                Start free trial
              </Link>

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-bone-mute">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
