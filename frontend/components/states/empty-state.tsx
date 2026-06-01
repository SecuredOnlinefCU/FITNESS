import { ArrowRight, Inbox } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  icon,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
          {icon || <Inbox className="h-8 w-8" />}
        </div>
        <h2 className="mt-4 text-xl font-black">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
        {actionHref && actionLabel ? (
          <Link href={actionHref} className="mt-5 inline-flex" aria-label={actionLabel}>
            <Button variant="primary" size="lg">
              {actionLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
