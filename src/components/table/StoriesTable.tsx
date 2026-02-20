import type { ClientStory, StoryState } from "@shared/types/index.js";
import { useMemo, useState } from "react";
import { STATE_COLORS, STATE_ORDER } from "../../lib/constants.js";
import { Badge } from "../ui/Badge.js";
import { Skeleton } from "../ui/Skeleton.js";
import { Filters } from "./Filters.js";

interface StoriesTableProps {
  stories: ClientStory[] | undefined;
  isLoading: boolean;
}

type SortKey = "state" | "assignee" | "effort" | "priority";
type SortDir = "asc" | "desc";

const PRIORITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3, Unset: 4 };

export function StoriesTable({ stories, isLoading }: StoriesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("state");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [stateFilter, setStateFilter] = useState<StoryState | "All">("All");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const assignees = useMemo(() => {
    if (!stories) return [];
    return [...new Set(stories.map((s) => s.assignee))].sort();
  }, [stories]);

  const filtered = useMemo(() => {
    if (!stories) return [];
    let result = stories;

    if (stateFilter !== "All") {
      result = result.filter((s) => s.state === stateFilter);
    }
    if (assigneeFilter) {
      result = result.filter((s) => s.assignee === assigneeFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "state":
          cmp = STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state);
          break;
        case "assignee":
          cmp = a.assignee.localeCompare(b.assignee);
          break;
        case "effort":
          cmp = a.effort - b.effort;
          break;
        case "priority":
          cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [stories, stateFilter, assigneeFilter, searchQuery, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  if (isLoading) {
    return (
      <div className="mb-6">
        <Skeleton className="mb-2 h-6 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="mb-1 h-8" />
        ))}
      </div>
    );
  }

  if (!stories) return null;

  return (
    <div className="mb-6">
      <h3 className="mb-3 text-base font-semibold">Stories</h3>
      <Filters
        stateFilter={stateFilter}
        assigneeFilter={assigneeFilter}
        searchQuery={searchQuery}
        assignees={assignees}
        onStateChange={setStateFilter}
        onAssigneeChange={setAssigneeFilter}
        onSearchChange={setSearchQuery}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs text-gray-500">
              <th className="pb-2 pr-4">ID</th>
              <th className="pb-2 pr-4">Title</th>
              <th
                className="cursor-pointer pb-2 pr-4"
                onClick={() => toggleSort("state")}
              >
                State{sortIndicator("state")}
              </th>
              <th
                className="cursor-pointer pb-2 pr-4"
                onClick={() => toggleSort("assignee")}
              >
                Assignee{sortIndicator("assignee")}
              </th>
              <th
                className="cursor-pointer pb-2 pr-4"
                onClick={() => toggleSort("effort")}
              >
                Effort{sortIndicator("effort")}
              </th>
              {/* <th
                className="cursor-pointer pb-2 pr-4"
                onClick={() => toggleSort("priority")}
              >
                Priority{sortIndicator("priority")}
              </th> */}
              <th className="pb-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((story) => (
              <tr
                key={story.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-2 pr-4 text-gray-400">{story.id}</td>
                <td className="py-2 pr-4 font-medium">{story.title}</td>
                <td className="py-2 pr-4">
                  <Badge
                    label={story.state}
                    className={STATE_COLORS[story.state]}
                  />
                </td>
                <td className="py-2 pr-4">{story.assignee}</td>
                <td className="py-2 pr-4">{story.effort || "—"}</td>
                {/* <td className="py-2 pr-4">
                  <Badge
                    label={story.priority}
                    className={PRIORITY_COLORS[story.priority]}
                  />
                </td> */}
                <td className="py-2 text-gray-400">{story.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
