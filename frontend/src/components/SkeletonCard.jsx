import GlassCard from "./GlassCard";

export function SkeletonCard() {
  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between gap-3 animate-pulse">
        <div className="min-w-0 flex-1 space-y-2.5">
          {/* Tag & ID row */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-16 rounded bg-zinc-200/70 dark:bg-zinc-800/60" />
          </div>
          {/* Complaint title */}
          <div className="h-5 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800" />
          {/* Subtitle / student info */}
          <div className="h-3.5 w-2/5 rounded bg-zinc-200/60 dark:bg-zinc-800/50" />
        </div>
        {/* Status badge & date on right */}
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="h-5 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-14 rounded bg-zinc-200/60 dark:bg-zinc-800/50" />
        </div>
      </div>
    </GlassCard>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export default SkeletonCard;
