import Link from 'next/link';
import { LevelFitLogo } from '@/components/levelfitness/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background bg-grid-white px-4">
      <div className="mb-8">
        <Link href="/" aria-label="Go to homepage">
          <LevelFitLogo size={36} />
        </Link>
      </div>
      {children}
    </div>
  );
}
