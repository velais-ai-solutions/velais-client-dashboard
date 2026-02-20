import type { ClientStory } from "@shared/types/index.js";
import { STATE_ORDER } from "../../lib/constants.js";
import { Skeleton } from "../ui/Skeleton.js";
import { Column } from "./Column.js";

interface BoardProps {
  stories: ClientStory[] | undefined;
  isLoading: boolean;
}

export function Board({ stories, isLoading }: BoardProps) {
  if (isLoading) {
    return (
      <div className="mb-6 flex gap-4 overflow-x-auto">
        {STATE_ORDER.map((state) => (
          <div key={state} className="min-w-[220px] flex-1">
            <Skeleton className="mb-2 h-6 w-24" />
            <Skeleton className="mb-2 h-24" />
            <Skeleton className="h-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!stories) return null;

  const grouped = new Map(STATE_ORDER.map((s) => [s, [] as ClientStory[]]));
  for (const story of stories) {
    grouped.get(story.state)?.push(story);
  }

  return (
    <div className="mb-6">
      <h3 className="mb-3 text-base font-semibold">Kanban Board</h3>
      <div className="flex max-h-[500px] gap-4 overflow-x-auto overflow-y-auto pb-2">
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
