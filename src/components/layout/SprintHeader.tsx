import type { SprintSummary } from "@shared/types/index.js";
import { Skeleton } from "../ui/Skeleton.js";

interface SprintHeaderProps {
  summary: SprintSummary | undefined;
  isLoading: boolean;
}

export function SprintHeader({ summary, isLoading }: SprintHeaderProps) {
  if (isLoading) {
    return (
      <div className="mb-6 bg-bg-card border border-border-subtle rounded-md overflow-hidden px-5 py-4">
        <Skeleton className="mb-2 h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    );
  }

  if (!summary) return null;

  const progressPct = Math.min(summary.progress, 100);

  return (
    <div className="mb-6 bg-bg-card border border-border-subtle rounded-md overflow-hidden px-5 py-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold tracking-[0.02em] text-text-primary">
          {summary.sprintName}
        </h2>
        <span className="font-mono text-sm text-text-accent">
          {summary.daysRemaining} days remaining
        </span>
      </div>
      <p className="mb-3 font-mono text-sm text-text-secondary tracking-[0.03em]">
        {summary.startDate && summary.endDate
          ? `${new Date(summary.startDate).toLocaleDateString()} — ${new Date(summary.endDate).toLocaleDateString()} · `
          : "No dates set · "}
        {summary.total} stories &middot; {summary.storyPoints.total} points
      </p>
      <div className="h-2 w-full rounded-full bg-bg-surface">
        <div
          className="h-2 rounded-full bg-status-live transition-[width] duration-600 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <p className="mt-1 font-mono text-xs text-text-secondary tracking-[0.03em]">
        {summary.storyPoints.completed}/{summary.storyPoints.total} story points
        ({summary.progress}%)
      </p>
    </div>
  );
}
