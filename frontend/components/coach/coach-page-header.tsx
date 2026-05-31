import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CoachPageHeader({
  title,
  subtitle,
  actionHref,
  actionLabel,
}: {
  title: string;
  subtitle: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-primary">LevelFit Coach</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl font-display">{title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
      </div>
      {actionHref && actionLabel ? (
        <Link href={actionHref}>
          <Button>{actionLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}
