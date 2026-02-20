import type { StoryState } from "@shared/types/index.js";
import { STATE_ORDER } from "../../lib/constants.js";

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
      <select
        value={stateFilter}
        onChange={(e) => onStateChange(e.target.value as StoryState | "All")}
        className="rounded border border-gray-300 px-2 py-1 text-sm"
      >
        <option value="All">All States</option>
        {STATE_ORDER.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={assigneeFilter}
        onChange={(e) => onAssigneeChange(e.target.value)}
        className="rounded border border-gray-300 px-2 py-1 text-sm"
      >
        <option value="">All Assignees</option>
        {assignees.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Search stories..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="rounded border border-gray-300 px-2 py-1 text-sm"
      />
    </div>
  );
}
