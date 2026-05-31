'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const faqs = [
  { q: 'Can I try before committing to a paid plan?', a: 'Yes — start your 30-day free trial with full access to all features. No credit card required.' },
  { q: 'Can I switch plans later?', a: 'Absolutely. Upgrade or downgrade anytime. Changes take effect immediately.' },
  { q: 'How does the AI workout builder work?', a: 'Our AI analyzes your clients\' goals, equipment, and experience to generate personalized workout programs in seconds.' },
  { q: 'Can I import existing client data?', a: 'Yes. We support CSV imports for client profiles, workout history, and nutrition plans.' },
  { q: 'Is there a client mobile app?', a: 'Clients access everything through a white-label mobile app available on iOS and Android.' },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-ink-900/50">
      <div className="mx-auto max-w-3xl px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-3xl font-bold md:text-4xl tracking-tight text-center mb-12"
        >
          Frequently asked questions
        </motion.h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-line bg-ink-950 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
                className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-medium"
              >
                {faq.q}
                <Plus
                  className={`h-4 w-4 shrink-0 text-bone-fade transition-transform duration-200 ${
                    openIndex === i ? 'rotate-45' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p id={`faq-answer-${i}`} className="px-6 pb-4 text-sm text-bone-mute">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
