import type { StoryState, WorkItemType } from "@shared/types/index.js";
import { STATE_ORDER } from "../../lib/constants.js";
import { Input } from "../ui/input.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select.js";

interface FiltersProps {
  stateFilter: StoryState | "All";
  typeFilter: WorkItemType | "All";
  assigneeFilter: string;
  searchQuery: string;
  assignees: string[];
  onStateChange: (state: StoryState | "All") => void;
  onTypeChange: (type: WorkItemType | "All") => void;
  onAssigneeChange: (assignee: string) => void;
  onSearchChange: (query: string) => void;
}

export function Filters({
  stateFilter,
  typeFilter,
  assigneeFilter,
  searchQuery,
  assignees,
  onStateChange,
  onTypeChange,
  onAssigneeChange,
  onSearchChange,
}: FiltersProps) {
  return (
    <div className="mb-3 flex flex-wrap gap-3">
      <Select
        value={stateFilter}
        onValueChange={(v) => onStateChange(v as StoryState | "All")}
      >
        <SelectTrigger size="sm">
          <SelectValue placeholder="All States" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All States</SelectItem>
          {STATE_ORDER.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={typeFilter}
        onValueChange={(v) => onTypeChange(v as WorkItemType | "All")}
      >
        <SelectTrigger size="sm">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All Types</SelectItem>
          <SelectItem value="story">Story</SelectItem>
          <SelectItem value="bug">Bug</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={assigneeFilter || "all"}
        onValueChange={(v) => onAssigneeChange(v === "all" ? "" : v)}
      >
        <SelectTrigger size="sm">
          <SelectValue placeholder="All Assignees" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assignees</SelectItem>
          {assignees.map((a) => (
            <SelectItem key={a} value={a}>
              {a}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="text"
        placeholder="Search items..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-8 w-48"
      />
    </div>
  );
}
