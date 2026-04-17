export function EmergencyBadge({ emergency }: { emergency: boolean }) {
  if (!emergency) return null;

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-danger/25 bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger shadow-[0_0_0_1px_rgba(220,38,38,0.04)]">
      <span className="size-1.5 rounded-full bg-danger" />
      Emergency
    </span>
  );
}
