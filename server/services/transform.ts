import type {
  AssigneeSummary,
  ClientStory,
  IterationInfo,
  Priority,
  SprintSummary,
  StoryState,
  TeamMember,
  WorkItemType,
} from "../../shared/types/index.js";
import { getInitials } from "../../shared/utils.js";
import type { AzureWorkItem } from "./azure-devops.js";

const STATE_MAP: Record<string, StoryState> = {
  New: "Planned",
  "To Do": "Planned",
  Active: "In Progress",
  "In Progress": "In Progress",
  Resolved: "In Review",
  QA: "In Review",
  "In Review": "In Review",
  Closed: "Completed",
  Done: "Completed",
  Completed: "Completed",
  Blocked: "Blocked",
};

const PRIORITY_MAP: Record<number, Priority> = {
  1: "Critical",
  2: "High",
  3: "Medium",
  4: "Low",
};

function mapState(azureState: string): StoryState {
  return STATE_MAP[azureState] ?? "Planned";
}

function mapPriority(priority: number | null | undefined): Priority {
  if (priority == null) return "Unset";
  return PRIORITY_MAP[priority] ?? "Unset";
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

function computeSprintDays(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
) {
  const hasValidDates = Boolean(startDate && endDate);
  const start = hasValidDates ? new Date(startDate!) : null;
  const end = hasValidDates ? new Date(endDate!) : null;
  const now = new Date();
  const msPerDay = 1000 * 60 * 60 * 24;

  return {
    totalDays:
      start && end
        ? Math.ceil((end.getTime() - start.getTime()) / msPerDay)
        : 0,
    daysElapsed: start
      ? Math.max(0, Math.ceil((now.getTime() - start.getTime()) / msPerDay))
      : 0,
    daysRemaining: end
      ? Math.max(0, Math.ceil((end.getTime() - now.getTime()) / msPerDay))
      : 0,
  };
}

function mapWorkItemType(azureType: string): WorkItemType {
  return azureType === "Bug" ? "bug" : "story";
}

export function transformWorkItem(item: AzureWorkItem): ClientStory {
  const fields = item.fields;
  const assignedTo = fields["System.AssignedTo"] as
    | { displayName?: string }
    | undefined;
  const assignee = assignedTo?.displayName ?? "Unassigned";
  const tags = (fields["System.Tags"] as string | undefined) ?? "";

  return {
    id: item.id,
    type: mapWorkItemType(
      (fields["System.WorkItemType"] as string) ?? "User Story",
    ),
    title: (fields["System.Title"] as string) ?? "",
    state: mapState((fields["System.State"] as string) ?? "New"),
    assignee,
    effort: (fields["Microsoft.VSTS.Scheduling.Effort"] as number) ?? 0,
    priority: mapPriority(
      fields["Microsoft.VSTS.Common.Priority"] as number | undefined,
    ),
    targetDate:
      (fields["Microsoft.VSTS.Scheduling.TargetDate"] as string) ?? null,
    tags: tags
      ? tags
          .split(";")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    lastUpdated: formatRelativeTime(
      (fields["System.ChangedDate"] as string) ?? new Date().toISOString(),
    ),
  };
}

export function buildSummary(
  stories: ClientStory[],
  iteration: {
    projectName: string;
    name: string;
    startDate: string;
    endDate: string;
  },
): SprintSummary {
  const { totalDays, daysElapsed, daysRemaining } = computeSprintDays(
    iteration.startDate,
    iteration.endDate,
  );

  const byState: Record<StoryState, number> = {
    Planned: 0,
    "In Progress": 0,
    "In Review": 0,
    Completed: 0,
    Blocked: 0,
  };

  const assigneeMap = new Map<
    string,
    { count: number; points: number; pointsCompleted: number }
  >();

  let totalPoints = 0;
  let completedPoints = 0;
  let inProgressPoints = 0;

  for (const story of stories) {
    byState[story.state] = (byState[story.state] ?? 0) + 1;
    totalPoints += story.effort;

    if (story.state === "Completed") completedPoints += story.effort;
    if (story.state === "In Progress") inProgressPoints += story.effort;

    const existing = assigneeMap.get(story.assignee) ?? {
      count: 0,
      points: 0,
      pointsCompleted: 0,
    };
    existing.count++;
    existing.points += story.effort;
    if (story.state === "Completed") existing.pointsCompleted += story.effort;
    assigneeMap.set(story.assignee, existing);
  }

  const byAssignee: AssigneeSummary[] = Array.from(assigneeMap.entries()).map(
    ([name, data]) => ({
      name,
      initials: getInitials(name),
      count: data.count,
      points: data.points,
    }),
  );

  const teamMembers: TeamMember[] = Array.from(assigneeMap.entries()).map(
    ([name, data]) => ({
      name,
      initials: getInitials(name),
      storiesCount: data.count,
      pointsTotal: data.points,
      pointsCompleted: data.pointsCompleted,
    }),
  );

  const progress = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;

  return {
    projectName: iteration.projectName,
    sprintName: iteration.name,
    startDate: iteration.startDate,
    endDate: iteration.endDate,
    daysRemaining,
    daysElapsed,
    totalDays,
    total: stories.length,
    byState,
    byAssignee,
    storyPoints: {
      total: totalPoints,
      completed: completedPoints,
      inProgress: inProgressPoints,
      remaining: Math.max(0, totalPoints - completedPoints - inProgressPoints),
    },
    progress: Math.round(progress),
    teamMembers,
  };
}

export function buildIterationInfo(iteration: {
  name: string;
  path: string;
  attributes: { startDate: string; finishDate: string };
}): IterationInfo {
  const { totalDays, daysElapsed, daysRemaining } = computeSprintDays(
    iteration.attributes.startDate,
    iteration.attributes.finishDate,
  );

  return {
    name: iteration.name,
    path: iteration.path,
    startDate: iteration.attributes.startDate ?? null,
    endDate: iteration.attributes.finishDate ?? null,
    daysRemaining,
    daysElapsed,
    totalDays,
  };
}
