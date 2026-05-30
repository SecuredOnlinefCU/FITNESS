import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function ActionCard({ title, description, href, label }: { title: string; description: string; href: string; label: string }) {
  return (
    <Link href={href}>
      <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div>
            <h3 className="font-bold">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs font-bold text-primary">
            {label}
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
