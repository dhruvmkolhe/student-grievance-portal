export default function GlassCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-lg border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] dark:border-zinc-800 dark:bg-zinc-900/60 dark:shadow-none transition-all duration-150 ${className}`}
    >
      {children}
    </div>
  );
}
