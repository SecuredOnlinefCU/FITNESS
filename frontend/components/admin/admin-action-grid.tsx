import Link from 'next/link';
import { Shield, Users, Flag, ScrollText, Truck, Webhook } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const actions = [
  { title: 'Users', description: 'Review users and update account status.', href: '/admin/users', icon: Users },
  { title: 'Reports', description: 'Moderation queue and content reports.', href: '/admin/reports', icon: Flag },
  { title: 'Audit logs', description: 'Track admin actions and sensitive changes.', href: '/admin/audit-logs', icon: ScrollText },
  { title: 'Feature flags', description: 'Control platform rollout safely.', href: '/admin/feature-flags', icon: Shield },
  { title: 'Delivery logs', description: 'Email and push notification delivery.', href: '/admin/delivery-logs', icon: Truck },
  { title: 'Webhooks', description: 'Inspect Stripe event processing.', href: '/admin/webhooks', icon: Webhook },
];

export function AdminActionGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.href} href={action.href}>
            <Card className="transition hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex gap-4 p-5">
                <div className="rounded-2xl bg-muted p-3 text-primary"><Icon className="h-5 w-5" /></div>
                <div>
                  <h2 className="font-black">{action.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
