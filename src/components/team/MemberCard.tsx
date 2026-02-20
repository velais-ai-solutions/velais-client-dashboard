import type { TeamMember } from "@shared/types/index.js";
import { Avatar } from "../ui/Avatar.js";

interface MemberCardProps {
  member: TeamMember;
}

export function MemberCard({ member }: MemberCardProps) {
  return (
    <div className="flex items-center gap-3 bg-bg-card border border-border-subtle rounded-md px-5 py-3">
      <Avatar initials={member.initials} />
      <div>
        <p className="font-mono text-sm font-medium text-text-primary">
          {member.name}
        </p>
        <p className="font-mono text-xs text-text-secondary">
          {member.storiesCount} stories · {member.pointsCompleted}/
          {member.pointsTotal} pts
        </p>
      </div>
    </div>
  );
}
