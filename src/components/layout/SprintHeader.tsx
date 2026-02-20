import type { SprintSummary } from "@shared/types/index.js";
import { Skeleton } from "../ui/Skeleton.js";

interface SprintHeaderProps {
  summary: SprintSummary | undefined;
  isLoading: boolean;
}

export function SprintHeader({ summary, isLoading }: SprintHeaderProps) {
  if (isLoading) {
    return (
      <div className="mb-6 rounded border border-gray-200 bg-white p-4">
        <Skeleton className="mb-2 h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    );
  }

  if (!summary) return null;

  const progressPct = Math.min(summary.progress, 100);

  return (
    <div className="mb-6 rounded border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{summary.sprintName}</h2>
        <span className="text-sm text-gray-500">
          {summary.daysRemaining} days remaining
        </span>
      </div>
      <p className="mb-3 text-sm text-gray-500">
        {summary.startDate && summary.endDate
          ? `${new Date(summary.startDate).toLocaleDateString()} — ${new Date(summary.endDate).toLocaleDateString()} · `
          : "No dates set · "}
        {summary.total} stories &middot; {summary.storyPoints.total} points
      </p>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-green-500 transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {summary.storyPoints.completed}/{summary.storyPoints.total} story points
        ({summary.progress}%)
      </p>
    </div>
  );
}
