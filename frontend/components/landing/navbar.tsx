'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { LevelFitLogo } from '@/components/levelfitness/logo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#testimonials', label: 'Testimonials' },
  ];

  return (
    <header
      className={"fixed top-0 left-0 right-0 z-50 transition-all duration-300"}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <Link href="/" className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md">
          <LevelFitLogo size={28} />
        </Link>

        <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8 text-sm text-bone-mute">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} className="hover:text-bone transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md">{l.label}</a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm text-bone-mute hover:text-bone transition-colors">Log in</Link>
          <Link
            href="/signup"
            className="rounded-lg bg-signal px-4 py-2 text-sm font-medium text-ink-950 hover:brightness-95 transition-all"
          >
            Start free trial
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex md:hidden items-center justify-center rounded-xl p-2 text-bone-mute hover:text-bone transition-colors"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 top-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative flex flex-col items-center gap-6 bg-ink-950 px-6 pb-8 pt-20 shadow-xl">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="text-lg text-bone-mute hover:text-bone transition-colors">
                {l.label}
              </a>
            ))}
            <hr className="w-24 border-line/50" />
            <Link href="/login" onClick={() => setMobileOpen(false)} className="text-lg text-bone-mute hover:text-bone transition-colors">Log in</Link>
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg bg-signal px-6 py-3 text-base font-medium text-ink-950 hover:brightness-95 transition-all"
            >
              Start free trial
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
