import type { ClientStory } from "@shared/types/index.js";
import { getInitials } from "@shared/utils.js";
import { Avatar } from "../ui/Avatar.js";
import { Badge } from "../ui/Badge.js";

interface CardProps {
  story: ClientStory;
}

export function Card({ story }: CardProps) {
  return (
    <div className="rounded border border-gray-200 bg-white p-3">
      <p className="mb-2 text-sm font-medium">{story.title}</p>
      <div className="flex items-center gap-2">
        <Avatar initials={getInitials(story.assignee)} />
        <span className="text-xs text-gray-500">{story.assignee}</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        {story.effort > 0 && <Badge label={`${story.effort} pts`} />}
        {/* {story.priority !== "Unset" && (
          <Badge label={story.priority} className={PRIORITY_COLORS[story.priority]} />
        )} */}
      </div>
    </div>
  );
}
