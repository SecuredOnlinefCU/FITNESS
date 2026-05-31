import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ink-950 px-6 text-center">
      <h1 className="font-display text-8xl font-black text-primary">404</h1>
      <h2 className="text-2xl font-black tracking-tight">Page not found</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:brightness-95"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>
    </div>
  );
}
