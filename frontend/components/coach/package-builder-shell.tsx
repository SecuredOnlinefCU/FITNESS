'use client';

import { useState } from 'react';
import { paymentsApi } from '@/lib/api/modules/payments';
import { useAsyncData } from '@/hooks/data/use-async-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CardSkeleton } from '@/components/states/skeleton';
import { Package } from 'lucide-react';
import type { CoachingPackage } from '@/lib/types/domain';

export function PackageBuilderShell() {
  const packages = useAsyncData(() => paymentsApi.listPackages(), []);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('199');
  const [billingType, setBillingType] = useState<'ONE_TIME' | 'RECURRING'>('RECURRING');
  const [status, setStatus] = useState<string | null>(null);

  async function createPackage(event: React.FormEvent) {
    event.preventDefault();
    setStatus('Creating package...');
    try {
      await paymentsApi.createPackage({
        title,
        priceCents: Math.round(Number(price) * 100),
        currency: 'usd',
        billingType,
        interval: billingType === 'RECURRING' ? 'MONTH' : undefined,
      });
      setStatus('Package created.');
      setTitle('');
      packages.reload();
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to create package.');
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={createPackage}>
          <CardContent className="space-y-4 p-5">
            <div>
              <h2 className="text-xl font-black">Create coaching package</h2>
              <p className="text-sm text-muted-foreground">Add a new checkout-ready offer for clients.</p>
            </div>
            <Input placeholder="Package title" value={title} onChange={(event) => setTitle(event.target.value)} />
            <Input placeholder="Price in USD" value={price} onChange={(event) => setPrice(event.target.value)} />
            <Select value={billingType} onChange={(event) => setBillingType(event.target.value as 'ONE_TIME' | 'RECURRING')}>
              <option value="RECURRING">Monthly recurring</option>
              <option value="ONE_TIME">One-time</option>
            </Select>
            {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
            <Button type="submit" disabled={!title || !price}>Create package</Button>
          </CardContent>
        </form>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black">
            <Package className="h-5 w-5 text-primary" />
            Your packages
          </h2>
          {packages.loading ? (
            <div className="space-y-3"><CardSkeleton /><CardSkeleton /></div>
          ) : packages.error ? (
            <p className="text-sm text-pulse">Could not load packages.</p>
          ) : !packages.data?.items?.length ? (
            <p className="text-sm text-muted-foreground">No packages yet. Create one above.</p>
          ) : (
            <div className="space-y-3">
              {packages.data.items.map((pkg: CoachingPackage) => (
                <div key={pkg.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-bold">{pkg.title}</p>
                    <p className="text-xs text-muted-foreground">
                      ${(pkg.priceCents / 100).toFixed(2)} {pkg.currency.toUpperCase()}
                      {pkg.billingType === 'RECURRING' ? ` / ${(pkg.interval || 'month').toLowerCase()}` : ' one-time'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
