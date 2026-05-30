import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function CoachActionCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link href={href}>
      <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div>
            <h3 className="font-bold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
        </CardContent>
      </Card>
    </Link>
  );
}
