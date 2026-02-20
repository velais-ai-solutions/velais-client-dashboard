import type { StoryState } from "@shared/types/index.js";
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
  assigneeFilter: string;
  searchQuery: string;
  assignees: string[];
  onStateChange: (state: StoryState | "All") => void;
  onAssigneeChange: (assignee: string) => void;
  onSearchChange: (query: string) => void;
}

export function Filters({
  stateFilter,
  assigneeFilter,
  searchQuery,
  assignees,
  onStateChange,
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
        placeholder="Search stories..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-8 w-48"
      />
    </div>
  );
}
