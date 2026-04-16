export function EmergencyBadge({ emergency }: { emergency: boolean }) {
  if (!emergency) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white shadow-[0_0_8px_rgba(220,38,38,0.6)] dark:bg-red-500 dark:shadow-[0_0_10px_rgba(239,68,68,0.5)]">
      Emergency
    </span>
  );
}
