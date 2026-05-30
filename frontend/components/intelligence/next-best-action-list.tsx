'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { intelligenceApi } from '@/lib/api/modules/intelligence';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function NextBestActionList({ items = [], onComplete }: { items?: any[]; onComplete?: () => void }) {
  if (!items.length) return null;

  async function complete(id: string) {
    await intelligenceApi.completeRecommendation(id);
    onComplete?.();
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-black">Next best actions</h2>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-black">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.body}</p>
                </div>
                <div className="flex gap-2">
                  {item.actionHref ? <Link href={item.actionHref}><Button variant="secondary">Open <ArrowRight className="ml-2 h-4 w-4" /></Button></Link> : null}
                  <Button onClick={() => complete(item.id)}>Done</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
