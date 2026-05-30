import { levelFitnessBrand } from '@/lib/brand/levelfitness';

export function LevelFitnessBrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-base font-black text-primary-foreground shadow-sm">
        LF
      </div>
      <div>
        <p className="text-lg font-black leading-none tracking-tight">{levelFitnessBrand.name}</p>
        <p className="text-xs text-muted-foreground">{levelFitnessBrand.tagline}</p>
      </div>
    </div>
  );
}
