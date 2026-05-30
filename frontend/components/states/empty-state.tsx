import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6 text-center">
        <h2 className="text-xl font-black">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
        {actionHref && actionLabel ? (
          <Link href={actionHref} className="mt-5 inline-flex">
            <Button>
              {actionLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
