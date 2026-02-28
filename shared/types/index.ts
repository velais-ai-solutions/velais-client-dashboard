export type StoryState =
  | "Planned"
  | "In Progress"
  | "In Review"
  | "Completed"
  | "Blocked";

export type Priority = "Critical" | "High" | "Medium" | "Low" | "Unset";

export type WorkItemType = "story" | "bug";

export interface ClientStory {
  type: WorkItemType;
  id: number;
  title: string;
  state: StoryState;
  assignee: string;
  effort: number;
  priority: Priority;
  targetDate: string | null;
  tags: string[];
  lastUpdated: string;
}

export interface AssigneeSummary {
  name: string;
  initials: string;
  count: number;
  points: number;
}

export interface TeamMember {
  name: string;
  initials: string;
  storiesCount: number;
  pointsTotal: number;
  pointsCompleted: number;
}

export interface SprintSummary {
  projectName: string;
  sprintName: string;
  startDate: string | null;
  endDate: string | null;
  daysRemaining: number;
  daysElapsed: number;
  totalDays: number;
  total: number;
  byState: Record<StoryState, number>;
  byAssignee: AssigneeSummary[];
  storyPoints: {
    total: number;
    completed: number;
    inProgress: number;
    remaining: number;
  };
  progress: number;
  teamMembers: TeamMember[];
}

export interface IterationInfo {
  name: string;
  path: string;
  startDate: string | null;
  endDate: string | null;
  daysRemaining: number;
  daysElapsed: number;
  totalDays: number;
}
