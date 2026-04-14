function LoadingCard() {
  return (
    <div className="surface animate-pulse p-6">
      <div className="h-4 w-32 rounded-full bg-muted" />
      <div className="mt-4 h-8 w-2/3 rounded-full bg-muted" />
      <div className="mt-3 h-4 w-full rounded-full bg-muted" />
      <div className="mt-2 h-4 w-5/6 rounded-full bg-muted" />
    </div>
  );
}

export default function FindLoading() {
  return (
    <div className="space-y-6">
      <LoadingCard />
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <div className="h-11 animate-pulse rounded-2xl bg-muted" />
        <div className="h-11 animate-pulse rounded-2xl bg-muted" />
      </div>
      <div className="space-y-4">
        <LoadingCard />
        <LoadingCard />
      </div>
    </div>
  );
}
