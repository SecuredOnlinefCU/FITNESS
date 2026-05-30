'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LevelFitLogo } from '@/components/levelfitness/logo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-ink-950/80 backdrop-blur-xl border-b border-line/50' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center">
          <LevelFitLogo size={28} />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-bone-mute">
          <a href="#features" className="hover:text-bone transition-colors">Features</a>
          <a href="#pricing" className="hover:text-bone transition-colors">Pricing</a>
          <a href="#testimonials" className="hover:text-bone transition-colors">Testimonials</a>
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
      </div>
    </header>
  );
}
