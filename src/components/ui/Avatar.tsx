interface AvatarProps {
  initials: string;
  className?: string;
}

export function Avatar({ initials, className = "" }: AvatarProps) {
  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-bg-surface text-xs font-semibold text-text-tertiary border border-border-subtle ${className}`}
    >
      {initials}
    </div>
  );
}
