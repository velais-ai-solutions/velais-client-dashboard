import type { ClientStory, StoryState } from "@shared/types/index.js";
import { STATE_COLORS } from "../../lib/constants.js";
import { Card } from "./Card.js";

interface ColumnProps {
  state: StoryState;
  stories: ClientStory[];
}

export function Column({ state, stories }: ColumnProps) {
  return (
    <div className="flex min-w-[220px] flex-1 flex-col">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${STATE_COLORS[state]}`}
        >
          {state}
        </span>
        <span className="text-xs text-gray-400">{stories.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {stories.map((story) => (
          <Card key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
