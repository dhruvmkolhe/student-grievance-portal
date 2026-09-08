const STATUS_MAP = {
  submitted: {
    label: "Submitted",
    badge: "text-zinc-700 bg-zinc-100 border-zinc-200 dark:text-zinc-300 dark:bg-zinc-800/70 dark:border-zinc-700",
    dot: "bg-zinc-500 dark:bg-zinc-400",
  },
  in_review: {
    label: "In Review",
    badge: "text-amber-800 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800/50",
    dot: "bg-amber-500 dark:bg-amber-400",
  },
  resolved: {
    label: "Resolved",
    badge: "text-emerald-800 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800/50",
    dot: "bg-emerald-500 dark:bg-emerald-400",
  },
  rejected: {
    label: "Rejected",
    badge: "text-rose-800 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-800/50",
    dot: "bg-rose-500 dark:bg-rose-400",
  },
};

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.submitted;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[11px] font-medium tracking-tight ${s.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
