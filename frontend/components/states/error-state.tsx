import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ErrorState({ message = 'Something went wrong.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <Card className="border-pulse/30 bg-pulse/5" role="alert">
      <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="h-6 w-6 shrink-0 text-pulse" />
          <div>
            <h2 className="font-black">Unable to load this section</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
        {onRetry ? (
          <Button variant="secondary" onClick={onRetry}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
