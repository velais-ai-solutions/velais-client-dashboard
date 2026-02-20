import type { ReactNode } from "react";

interface ShellProps {
  children: ReactNode;
  user?: { firstName?: string | null; lastName?: string | null } | null;
  onSignOut?: () => void;
}

export function Shell({ children, user, onSignOut }: ShellProps) {
  return (
    <div className="min-h-screen bg-bg-deep">
      <header className="sticky top-0 z-100 flex items-center justify-between border-b border-border-subtle h-14 px-8 max-md:px-4 backdrop-blur-[12px]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-interactive rounded-sm" />
          <h1 className="font-heading text-lg font-semibold tracking-[0.12em] uppercase text-text-primary">
            Client Dashboard
          </h1>
        </div>
        {user && onSignOut && (
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-text-secondary">
              {user.firstName} {user.lastName}
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-sm border border-border-default px-3 py-1.5 text-sm text-text-secondary hover:text-text-accent hover:border-text-accent transition-colors duration-150"
            >
              Sign Out
            </button>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-[1500px] p-8 max-md:px-4 max-md:py-5">
        {children}
      </main>
    </div>
  );
}
