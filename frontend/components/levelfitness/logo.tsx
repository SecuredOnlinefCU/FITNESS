import { twMerge } from 'tailwind-merge';

function MarkSvg({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="lfGrad" x1="14" y1="86" x2="86" y2="14">
          <stop offset="0" stopColor="var(--energy, #f97316)" />
          <stop offset="0.52" stopColor="var(--energy, #f97316)" />
          <stop offset="1" stopColor="var(--flow, #38bdf8)" />
        </linearGradient>
      </defs>
      <path d="M20 76 H38 V58 H56 V40 H72" stroke="var(--ink-900, #080a07)" strokeWidth="10" />
      <path d="M28 70 L44 54 L56 62 L80 28" stroke="url(#lfGrad)" strokeWidth="11" />
      <path d="M80 28 H62 M80 28 V46" stroke="url(#lfGrad)" strokeWidth="11" />
      <path d="M22 31 H39 L48 22" stroke="var(--flow, #38bdf8)" strokeWidth="5" opacity="0.95" />
      <circle cx="22" cy="31" r="4.5" fill="var(--flow, #38bdf8)" />
      <circle cx="48" cy="22" r="4.5" fill="var(--flow, #38bdf8)" />
      <path d="M24 45 C34 34 49 31 60 38" stroke="var(--energy, #f97316)" strokeWidth="5" opacity="0.95" />
    </svg>
  );
}

interface LevelFitLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

export function LevelFitMark({ size = 32, className }: LevelFitLogoProps) {
  return (
    <span className={twMerge('inline-flex shrink-0 items-center', className)} style={{ width: size, height: size }}>
      <MarkSvg className="h-full w-full" />
    </span>
  );
}

export function LevelFitLogo({ size = 32, className, showWordmark = true }: LevelFitLogoProps) {
  return (
    <span className={twMerge('inline-flex items-center gap-2.5', className)}>
      <LevelFitMark size={size} />
      {showWordmark && (
        <span className="whitespace-nowrap text-[15px] font-semibold leading-none tracking-tight text-bone">
          level<span className="text-energy">Fit</span>
        </span>
      )}
    </span>
  );
}
