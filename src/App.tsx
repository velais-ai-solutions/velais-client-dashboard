import { slugToOrgId } from "@shared/tenants.js";
import {
  Activity,
  lazy,
  Suspense,
  startTransition,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Board } from "./components/kanban/Board.js";
import { Loader } from "./components/Loader.js";
import { LoginPage } from "./components/LoginPage.js";
import { Shell } from "./components/layout/Shell.js";
import { StoriesTable } from "./components/table/StoriesTable.js";
import { Skeleton } from "./components/ui/Skeleton.js";
import { TooltipProvider } from "./components/ui/tooltip.js";
import { useStories } from "./hooks/useStories.js";
import { useSummary } from "./hooks/useSummary.js";
import { setGetAccessToken } from "./lib/api.js";
import { useServerAuth } from "./lib/auth.js";
import { useTenant } from "./lib/tenant.js";

const StateBreakdown = lazy(() =>
  import("./components/analytics/StateBreakdown.js").then((m) => ({
    default: m.StateBreakdown,
  })),
);

const AssigneeBreakdown = lazy(() =>
  import("./components/analytics/AssigneeBreakdown.js").then((m) => ({
    default: m.AssigneeBreakdown,
  })),
);

export function App() {
  const {
    isLoading: authLoading,
    user,
    signIn,
    signOut,
    getAccessToken,
  } = useServerAuth();
  const tenant = useTenant();
  useEffect(() => {
    setGetAccessToken(getAccessToken);
  }, [getAccessToken]);

  const { isLoading: storiesLoading } = useStories({ enabled: !!user });
  const { isLoading: summaryLoading } = useSummary({ enabled: !!user });

  const dataReady =
    !authLoading && (!user || (!storiesLoading && !summaryLoading));

  const [showLoader, setShowLoader] = useState(true);

  const handleLoaderComplete = useCallback(() => {
    setShowLoader(false);
  }, []);

  if (showLoader) {
    return <Loader dataReady={dataReady} onComplete={handleLoaderComplete} />;
  }

  if (!user) {
    const organizationId = tenant ? slugToOrgId.get(tenant.slug) : undefined;
    return <LoginPage onSignIn={() => signIn({ organizationId })} />;
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

const ANALYTICS_SKELETON = <Skeleton className="h-48 rounded-md" />;

function Dashboard({
  summary,
}: {
  summary?: ReturnType<typeof useSummary>["data"];
}) {
  const { data: stories, isLoading: storiesLoading } = useStories();
  const [view, setView] = useState<"kanban" | "table">("kanban");

  function handleViewChange(newView: "kanban" | "table") {
    startTransition(() => setView(newView));
  }

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
            <Suspense fallback={ANALYTICS_SKELETON}>
              <StateBreakdown byState={summary.byState} />
            </Suspense>
            <Suspense fallback={ANALYTICS_SKELETON}>
              <AssigneeBreakdown byAssignee={summary.byAssignee} />
            </Suspense>
          </div>
        </>
      )}

      <div
        data-gsap="subtitle"
        className="mb-4 inline-flex bg-bg-surface border border-border-subtle rounded-sm p-0.5"
      >
        <button
          type="button"
          onClick={() => handleViewChange("kanban")}
          className={`rounded-sm px-3 py-1.5 text-sm font-medium tracking-[0.06em] uppercase transition-colors ${
            view === "kanban"
              ? "bg-bg-card-hover text-text-accent border-b-2 border-interactive"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Kanban
        </button>
        <button
          type="button"
          onClick={() => handleViewChange("table")}
          className={`rounded-sm px-3 py-1.5 text-sm font-medium tracking-[0.06em] uppercase transition-colors ${
            view === "table"
              ? "bg-bg-card-hover text-text-accent border-b-2 border-interactive"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Table
        </button>
      </div>

      <div data-gsap="section-label">
        <Activity mode={view === "kanban" ? "visible" : "hidden"}>
          <Board stories={stories} isLoading={storiesLoading} />
        </Activity>
        <Activity mode={view === "table" ? "visible" : "hidden"}>
          <StoriesTable stories={stories} isLoading={storiesLoading} />
        </Activity>
      </div>
    </>
  );
}
