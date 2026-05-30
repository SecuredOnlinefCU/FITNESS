import Image from 'next/image';
import { LevelFitLogo } from '@/components/levelfitness/logo';

const taglines = [
  'train with purpose',
  'every rep every set',
  'stronger every single day',
  'progress over perfection',
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <div className="relative hidden w-1/2 md:block">
        <Image
          src="/images/auth-hero.png"
          alt=""
          fill
          className="object-cover"
          sizes="50vw"
          priority
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-950/60 via-ink-950/30 to-ink-950/80" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[120px]" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <LevelFitLogo size={36} />
          <div className="pb-16">
            {taglines.map((line, i) => (
              <p
                key={line}
                className={`text-3xl font-black uppercase leading-tight tracking-tight ${i === 0 ? 'bg-gradient-to-r from-signal to-flow bg-clip-text text-transparent' : 'text-bone'}`}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col items-center justify-center bg-background px-4 md:w-1/2">
        <div className="mb-10 md:hidden">
          <LevelFitLogo size={36} />
        </div>
        {children}
        <p className="relative mt-10 text-xs text-muted-foreground">&copy; 2026 LevelFITness. All rights reserved.</p>
      </div>
    </div>
  );
}
