import type { StoryState } from "@shared/types/index.js";

export const STATE_CHART_COLORS: Record<StoryState, string> = {
  Planned: "#DBE5F5",
  "In Progress": "#2A5CA1",
  "In Review": "#627EBF",
  Completed: "#AECCEB",
  Blocked: "#8D3D55",
};

export const ASSIGNEE_COLORS = [
  "#AECCEB",
  "#627EBF",
  "#2A5CA1",
  "#DBE5F5",
  "#1F3968",
  "#8D3D55",
  "#AECCEBCC",
  "#627EBFCC",
];
