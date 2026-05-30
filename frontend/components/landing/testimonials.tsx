'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Emma Storey-Gordon',
    role: 'Founder, ESG Fitness',
    quote: 'I\'ve coached over 8,000 clients and it simply wouldn\'t be possible without LevelFit.',
    img: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=120&q=80',
    stat: '8,000+',
    statLabel: 'clients coached',
  },
  {
    name: 'Joseph Guandolo',
    role: 'Owner, Facts Over Fads',
    quote: 'We\'ve generated over $750,000 in lifetime value, all through LevelFit.',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
    stat: '$750K+',
    statLabel: 'revenue generated',
  },
  {
    name: 'Rachel Henley',
    role: 'Founder, Henley Fitness',
    quote: 'The amount of retention is significantly higher than before. Our clients love the experience.',
    img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80',
    stat: '+90%',
    statLabel: 'client retention',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-ink-900/50">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-signal">Testimonials</span>
          <h2 className="text-3xl font-bold mt-3 md:text-4xl tracking-tight">Trusted by coaches worldwide</h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-2xl border border-line bg-ink-950 p-6"
            >
              <div className="mb-4">
                <span className="text-2xl font-bold text-signal">{t.stat}</span>
                <span className="block text-xs text-bone-fade mt-0.5">{t.statLabel}</span>
              </div>

              <blockquote className="text-sm text-bone-mute leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3">
                <img src={t.img} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-bone-fade">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
