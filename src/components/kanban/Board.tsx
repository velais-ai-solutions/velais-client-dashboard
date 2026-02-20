import type { ClientStory } from "@shared/types/index.js";
import { useMemo } from "react";
import { STATE_ORDER } from "../../lib/constants.js";
import { Skeleton } from "../ui/Skeleton.js";
import { Column } from "./Column.js";

interface BoardProps {
  stories: ClientStory[] | undefined;
  isLoading: boolean;
}

const BOARD_SKELETON = (
  <div className="mb-6 flex gap-3 overflow-x-auto">
    {STATE_ORDER.map((state) => (
      <div
        key={state}
        className="min-w-[220px] flex-1 rounded-md bg-bg-surface p-2"
      >
        <Skeleton className="mb-2 h-6 w-24" />
        <Skeleton className="mb-2 h-20 rounded-md" />
        <Skeleton className="h-20 rounded-md" />
      </div>
    ))}
  </div>
);

export function Board({ stories, isLoading }: BoardProps) {
  const grouped = useMemo(() => {
    const map = new Map(STATE_ORDER.map((s) => [s, [] as ClientStory[]]));
    if (stories) {
      for (const story of stories) {
        map.get(story.state)?.push(story);
      }
    }
    return map;
  }, [stories]);

  if (isLoading) return BOARD_SKELETON;

  if (!stories) return null;

  return (
    <div className="mb-6">
      <h3 className="mb-3 font-heading text-lg font-semibold tracking-[0.12em] uppercase text-text-primary">
        Kanban Board
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {STATE_ORDER.map((state) => (
          <Column
            key={state}
            state={state}
            stories={grouped.get(state) ?? []}
          />
        ))}
      </div>
    </div>
  );
}
