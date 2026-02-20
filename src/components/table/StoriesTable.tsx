import type { ClientStory, StoryState } from "@shared/types/index.js";
import { useMemo, useState } from "react";
import { STATE_COLORS, STATE_ORDER } from "../../lib/constants.js";
import { Badge } from "../ui/Badge.js";
import { Skeleton } from "../ui/Skeleton.js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table.js";
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
      <h3 className="mb-3 font-heading text-lg font-semibold tracking-[0.12em] uppercase text-text-primary">
        Stories
      </h3>
      <Filters
        stateFilter={stateFilter}
        assigneeFilter={assigneeFilter}
        searchQuery={searchQuery}
        assignees={assignees}
        onStateChange={setStateFilter}
        onAssigneeChange={setAssigneeFilter}
        onSearchChange={setSearchQuery}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => toggleSort("state")}
            >
              State{sortIndicator("state")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => toggleSort("assignee")}
            >
              Assignee{sortIndicator("assignee")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => toggleSort("effort")}
            >
              Effort{sortIndicator("effort")}
            </TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((story) => (
            <TableRow key={story.id}>
              <TableCell className="text-text-secondary font-mono">
                {story.id}
              </TableCell>
              <TableCell className="text-text-primary font-mono font-medium">
                {story.title}
              </TableCell>
              <TableCell>
                <Badge className={STATE_COLORS[story.state]}>
                  {story.state}
                </Badge>
              </TableCell>
              <TableCell className="text-text-primary font-mono text-sm">
                {story.assignee}
              </TableCell>
              <TableCell className="text-text-primary font-mono text-sm">
                {story.effort || "—"}
              </TableCell>
              <TableCell className="text-text-secondary font-mono text-sm tracking-[0.03em]">
                {story.lastUpdated}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
