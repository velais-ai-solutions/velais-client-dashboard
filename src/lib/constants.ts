import type {
  Priority,
  StoryState,
  WorkItemType,
} from "@shared/types/index.js";

export const STATE_COLORS: Record<StoryState, string> = {
  Planned: "bg-status-inactive-muted text-status-inactive",
  "In Progress": "bg-status-building-muted text-status-building",
  "In Review": "bg-status-review-muted text-status-review",
  Completed: "bg-status-live-muted text-status-live",
  Blocked: "bg-status-failed-muted text-status-failed",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  Critical: "bg-status-failed-muted text-status-failed",
  High: "bg-status-building-muted text-status-building",
  Medium: "bg-status-review-muted text-status-review",
  Low: "bg-status-inactive-muted text-status-inactive",
  Unset: "bg-bg-surface text-text-secondary",
};

export const TYPE_COLORS: Record<WorkItemType, string> = {
  story: "bg-status-building-muted text-status-building",
  bug: "bg-status-failed-muted text-status-failed",
};

export const STATE_ORDER: StoryState[] = [
  "Planned",
  "In Progress",
  "In Review",
  "Completed",
  "Blocked",
];
