import Link from 'next/link';
import { LevelFitLogo } from '@/components/levelfitness/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-grid-white opacity-50" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-flow/5 blur-[100px]" />
      <div className="mb-10">
        <Link href="/" aria-label="Go to homepage">
          <LevelFitLogo size={40} />
        </Link>
      </div>
      {children}
      <p className="mt-10 text-xs text-muted-foreground">&copy; 2026 LevelFITness. All rights reserved.</p>
    </div>
  );
}
