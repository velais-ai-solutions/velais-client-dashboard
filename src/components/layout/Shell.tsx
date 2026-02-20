import type { ReactNode } from "react";

interface ShellProps {
  children: ReactNode;
  user?: { firstName?: string | null; lastName?: string | null } | null;
  onSignOut?: () => void;
}

export function Shell({ children, user, onSignOut }: ShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Client Dashboard
        </h1>
        {user && onSignOut && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {user.firstName} {user.lastName}
            </span>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Sign Out
            </button>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  );
}
