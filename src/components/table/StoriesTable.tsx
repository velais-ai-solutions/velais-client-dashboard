import type {
  ClientStory,
  Priority,
  StoryState,
  WorkItemType,
} from "@shared/types/index.js";
import { useMemo, useState } from "react";
import { STATE_COLORS, STATE_ORDER, TYPE_COLORS } from "../../lib/constants.js";
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

type SortKey = "state" | "assignee" | "priority";
type SortDir = "asc" | "desc";

const PRIORITY_ORDER: Record<Priority, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
  Unset: 4,
};

const STATE_INDEX_MAP = new Map(STATE_ORDER.map((s, i) => [s, i]));

const LOADING_SKELETON = (
  <div className="mb-6">
    <Skeleton className="mb-2 h-6 w-32" />
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="mb-1 h-8" />
    ))}
  </div>
);

export function StoriesTable({ stories, isLoading }: StoriesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("state");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [stateFilter, setStateFilter] = useState<StoryState | "All">("All");
  const [typeFilter, setTypeFilter] = useState<WorkItemType | "All">("All");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const assignees = useMemo(() => {
    if (!stories) return [];
    return [...new Set(stories.map((s) => s.assignee))].sort();
  }, [stories]);

  const filtered = useMemo(() => {
    if (!stories) return [];
    const lowerQuery = searchQuery.toLowerCase();
    const result: ClientStory[] = [];
    for (const story of stories) {
      if (stateFilter !== "All" && story.state !== stateFilter) continue;
      if (typeFilter !== "All" && story.type !== typeFilter) continue;
      if (assigneeFilter && story.assignee !== assigneeFilter) continue;
      if (
        lowerQuery &&
        !story.title.toLowerCase().includes(lowerQuery) &&
        !story.tags.some((t) => t.toLowerCase().includes(lowerQuery))
      )
        continue;
      result.push(story);
    }
    return result.toSorted((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "state":
          cmp =
            (STATE_INDEX_MAP.get(a.state) ?? 0) -
            (STATE_INDEX_MAP.get(b.state) ?? 0);
          break;
        case "assignee":
          cmp = a.assignee.localeCompare(b.assignee);
          break;
        case "priority":
          cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [
    stories,
    stateFilter,
    typeFilter,
    assigneeFilter,
    searchQuery,
    sortKey,
    sortDir,
  ]);

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

  if (isLoading) return LOADING_SKELETON;

  if (!stories) return null;

  return (
    <div data-gsap="card" className="mb-6">
      <h3 className="mb-3 font-heading text-lg font-semibold tracking-[0.12em] uppercase text-text-primary">
        Work Items
      </h3>
      <Filters
        stateFilter={stateFilter}
        typeFilter={typeFilter}
        assigneeFilter={assigneeFilter}
        searchQuery={searchQuery}
        assignees={assignees}
        onStateChange={setStateFilter}
        onTypeChange={setTypeFilter}
        onAssigneeChange={setAssigneeFilter}
        onSearchChange={setSearchQuery}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Type</TableHead>
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
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((story) => (
            <TableRow key={story.id}>
              <TableCell className="text-text-secondary">{story.id}</TableCell>
              <TableCell>
                <Badge className={TYPE_COLORS[story.type]}>
                  {story.type === "bug" ? "Bug" : "Story"}
                </Badge>
              </TableCell>
              <TableCell className="text-text-primary font-medium">
                {story.title}
              </TableCell>
              <TableCell>
                <Badge className={STATE_COLORS[story.state]}>
                  {story.state}
                </Badge>
              </TableCell>
              <TableCell className="text-text-primary text-sm">
                {story.assignee}
              </TableCell>
              <TableCell className="text-text-secondary text-sm tracking-[0.03em]">
                {story.lastUpdated}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
