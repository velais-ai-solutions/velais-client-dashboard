import type { TeamMember } from "@shared/types/index.js";
import { Avatar } from "../ui/Avatar.js";

interface MemberCardProps {
  member: TeamMember;
}

export function MemberCard({ member }: MemberCardProps) {
  return (
    <div className="flex items-center gap-3 rounded border border-gray-200 bg-white p-3">
      <Avatar initials={member.initials} />
      <div>
        <p className="text-sm font-medium">{member.name}</p>
        <p className="text-xs text-gray-400">
          {member.storiesCount} stories · {member.pointsCompleted}/
          {member.pointsTotal} pts
        </p>
      </div>
    </div>
  );
}
