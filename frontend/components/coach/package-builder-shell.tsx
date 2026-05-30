'use client';

import { useState } from 'react';
import { paymentsApi } from '@/lib/api/modules/payments';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export function PackageBuilderShell() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('199');
  const [billingType, setBillingType] = useState<'ONE_TIME' | 'RECURRING'>('RECURRING');
  const [status, setStatus] = useState<string | null>(null);

  async function createPackage() {
    setStatus('Creating package...');
    try {
      await paymentsApi.createPackage({
        title,
        priceCents: Math.round(Number(price) * 100),
        currency: 'usd',
        billingType,
        interval: billingType === 'RECURRING' ? 'MONTH' : undefined,
      });
      setStatus('Package created. Clients can now check out.');
      setTitle('');
    } catch (error: any) {
      setStatus(error.message || 'Failed to create package.');
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div>
          <h2 className="text-xl font-black">Coaching package</h2>
          <p className="text-sm text-muted-foreground">Create checkout-ready offers for clients.</p>
        </div>
        <Input placeholder="Package title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <Input placeholder="Price in USD" value={price} onChange={(event) => setPrice(event.target.value)} />
        <Select value={billingType} onChange={(event) => setBillingType(event.target.value as any)}>
          <option value="RECURRING">Monthly recurring</option>
          <option value="ONE_TIME">One-time</option>
        </Select>
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
        <Button onClick={createPackage} disabled={!title || !price}>Create package</Button>
      </CardContent>
    </Card>
  );
}
