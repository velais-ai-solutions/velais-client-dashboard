import { useAuth } from "@workos-inc/authkit-react";
import { useCallback, useState } from "react";
import { AssigneeBreakdown } from "./components/analytics/AssigneeBreakdown.js";
import { StateBreakdown } from "./components/analytics/StateBreakdown.js";
import { Board } from "./components/kanban/Board.js";
import { Loader } from "./components/Loader.js";
import { Shell } from "./components/layout/Shell.js";
import { StoriesTable } from "./components/table/StoriesTable.js";
import { TooltipProvider } from "./components/ui/tooltip.js";
import { useStories } from "./hooks/useStories.js";
import { useSummary } from "./hooks/useSummary.js";
import { setGetAccessToken } from "./lib/api.js";

export function App() {
  const {
    isLoading: authLoading,
    user,
    signIn,
    signOut,
    getAccessToken,
  } = useAuth();
  setGetAccessToken(getAccessToken);

  const [showLoader, setShowLoader] = useState(true);

  const handleLoaderComplete = useCallback(() => {
    setShowLoader(false);
  }, []);

  if (showLoader) {
    return (
      <Loader dataReady={!authLoading} onComplete={handleLoaderComplete} />
    );
  }

  if (!user) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <h2 className="font-heading text-lg font-semibold text-text-primary">
            Welcome to Client Dashboard
          </h2>
          <p className="text-text-secondary">
            Sign in to view your sprint data.
          </p>
          <button
            type="button"
            onClick={() => signIn()}
            className="bg-interactive text-off-white hover:opacity-90 rounded-sm px-4 py-2 font-mono text-sm font-semibold tracking-[0.06em] uppercase"
          >
            Sign In
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <TooltipProvider>
      <AuthenticatedShell user={user} onSignOut={() => signOut()} />
    </TooltipProvider>
  );
}

function AuthenticatedShell({
  user,
  onSignOut,
}: {
  user: { firstName?: string | null; lastName?: string | null };
  onSignOut: () => void;
}) {
  const { data: summary } = useSummary();

  return (
    <Shell
      user={user}
      onSignOut={onSignOut}
      projectName={summary?.projectName}
      animate
    >
      <Dashboard summary={summary} />
    </Shell>
  );
}

function Dashboard({
  summary,
}: {
  summary?: ReturnType<typeof useSummary>["data"];
}) {
  const { data: stories, isLoading: storiesLoading } = useStories();
  const [view, setView] = useState<"kanban" | "table">("kanban");

  return (
    <>
      {summary && (
        <>
          <h3
            data-gsap="title"
            className="mb-3 font-heading text-lg font-semibold tracking-[0.12em] uppercase text-text-primary"
          >
            Analytics
          </h3>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* <ProgressSummary summary={summary} /> */}
            <StateBreakdown byState={summary.byState} />
            <AssigneeBreakdown byAssignee={summary.byAssignee} />
          </div>
        </>
      )}

      <div
        data-gsap="subtitle"
        className="mb-4 inline-flex bg-bg-surface border border-border-subtle rounded-sm p-0.5"
      >
        <button
          type="button"
          onClick={() => setView("kanban")}
          className={`rounded-sm px-3 py-1.5 font-mono text-sm font-medium tracking-[0.06em] uppercase transition-colors ${
            view === "kanban"
              ? "bg-bg-card-hover text-text-accent border-b-2 border-interactive"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Kanban
        </button>
        <button
          type="button"
          onClick={() => setView("table")}
          className={`rounded-sm px-3 py-1.5 font-mono text-sm font-medium tracking-[0.06em] uppercase transition-colors ${
            view === "table"
              ? "bg-bg-card-hover text-text-accent border-b-2 border-interactive"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Table
        </button>
      </div>

      <div data-gsap="section-label">
        {view === "kanban" ? (
          <Board stories={stories} isLoading={storiesLoading} />
        ) : (
          <StoriesTable stories={stories} isLoading={storiesLoading} />
        )}
      </div>
    </>
  );
}
