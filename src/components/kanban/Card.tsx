import type { ClientStory } from "@shared/types/index.js";
import { getInitials } from "@shared/utils.js";

import { Avatar } from "../ui/Avatar.js";
import { Badge } from "../ui/Badge.js";
import { Card, CardContent } from "../ui/card.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip.js";

interface KanbanCardProps {
  story: ClientStory;
}

export function KanbanCard({ story }: KanbanCardProps) {
  return (
    <Card className="gap-0 py-0">
      <CardContent className="px-4 pt-4 pb-3">
        <p className="text-sm font-semibold text-text-primary leading-snug">
          {story.title}
        </p>
      </CardContent>
      <div className="flex items-center justify-between border-t border-border-subtle px-4 py-2.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="cursor-default">
              <Avatar
                initials={getInitials(story.assignee)}
                className="h-7 w-7 text-[10px]"
              />
            </button>
          </TooltipTrigger>
          <TooltipContent>{story.assignee}</TooltipContent>
        </Tooltip>
        <div className="flex items-center gap-1.5">
          {story.type === "bug" && (
            <Badge className="bg-status-failed-muted border-status-failed text-status-failed text-xs rounded-sm">
              Bug
            </Badge>
          )}
          {story.effort > 0 && (
            <Badge className="bg-bg-surface text-text-secondary text-xs rounded-sm">
              {story.effort} pts
            </Badge>
          )}
        </div>
      </div>
      {/* {story.priority !== "Unset" && (
        <div className="border-t border-border-subtle px-4 py-2.5">
          <Badge className={PRIORITY_COLORS[story.priority]}>
            {story.priority}
          </Badge>
        </div>
      )} */}
    </Card>
  );
}
