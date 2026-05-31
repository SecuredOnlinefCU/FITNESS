'use client';

import { useEffect, useState, type ReactNode } from 'react';

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reduced) return;

    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let rafId: number;

    import('lenis').then((mod) => {
      const Lenis = mod.default;
      lenis = new Lenis({ duration: 1.2, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
      const r = (t: number) => {
        lenis?.raf(t);
        rafId = requestAnimationFrame(r);
      };
      rafId = requestAnimationFrame(r);
    });

    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
