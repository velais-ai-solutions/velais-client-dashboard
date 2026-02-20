import type { ReactNode } from "react";
import { useCascadeAnimation } from "@/hooks/useCascadeAnimation.js";

// import logo from "@/assets/Logo Symbol_Variable Width.svg";

interface ShellProps {
  children: ReactNode;
  projectName?: string;
  user?: { firstName?: string | null; lastName?: string | null } | null;
  onSignOut?: () => void;
  animate?: boolean;
}

export function Shell({
  children,
  projectName,
  user,
  onSignOut,
  animate = false,
}: ShellProps) {
  const containerRef = useCascadeAnimation(animate);

  return (
    <div ref={containerRef} className="min-h-screen bg-bg-deep">
      <header
        data-gsap="header"
        className="sticky top-0 z-100 flex items-center justify-between border-b border-border-subtle h-14 px-8 max-md:px-4 backdrop-blur-[12px]"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* <img src={logo} alt="Velais" className="w-8 h-8 shrink-0" /> */}
          <h1 className="font-heading text-lg max-md:text-base font-semibold tracking-[0.12em] uppercase text-text-primary truncate">
            {projectName ?? "Client Dashboard"}
          </h1>
        </div>
        {user && onSignOut && (
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <span className="font-mono text-sm text-text-secondary max-md:hidden">
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
