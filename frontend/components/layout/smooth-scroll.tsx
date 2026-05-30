'use client';

import { useEffect, type ReactNode } from 'react';

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
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
  }, []);

  return <>{children}</>;
}
