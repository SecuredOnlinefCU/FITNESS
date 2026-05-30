export function ClientPageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <p className="text-sm font-bold uppercase tracking-wide text-primary">LevelFITness</p>
      <h1 className="mt-1 text-3xl font-black tracking-tight md:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
    </div>
  );
}
