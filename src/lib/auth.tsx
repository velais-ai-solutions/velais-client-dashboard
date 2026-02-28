import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
}

interface SessionResponse {
  user: User | null;
  accessToken: string | null;
  organizationId: string | null;
}

interface AuthState {
  isLoading: boolean;
  user: User | null;
  accessToken: string | null;
  organizationId: string | null;
}

interface ServerAuthContextValue {
  isLoading: boolean;
  user: User | null;
  signIn: (opts?: { organizationId?: string }) => void;
  signOut: () => void;
  getAccessToken: () => Promise<string>;
}

const ServerAuthContext = createContext<ServerAuthContextValue | null>(null);

/** Token refresh margin: refresh 60s before expiry */
const REFRESH_MARGIN_MS = 60_000;

function parseJwtExp(token: string): number | null {
  try {
    const parts = token.split(".");
    if (!parts[1]) return null;
    const payload = JSON.parse(atob(parts[1]));
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function ServerAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    user: null,
    accessToken: null,
    organizationId: null,
  });

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const refreshPromiseRef = useRef<Promise<SessionResponse> | null>(null);

  const fetchSession = useCallback(async (): Promise<SessionResponse> => {
    const res = await fetch("/api/auth/session", {
      credentials: "include",
    });
    if (!res.ok) {
      return { user: null, accessToken: null, organizationId: null };
    }
    return res.json() as Promise<SessionResponse>;
  }, []);

  const scheduleRefresh = useCallback(
    (accessToken: string) => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      const exp = parseJwtExp(accessToken);
      if (!exp) return;

      const delay = Math.max(exp - Date.now() - REFRESH_MARGIN_MS, 0);

      refreshTimerRef.current = setTimeout(async () => {
        try {
          const session = await fetchSession();
          if (session.user && session.accessToken) {
            setState({
              isLoading: false,
              user: session.user,
              accessToken: session.accessToken,
              organizationId: session.organizationId,
            });
            scheduleRefresh(session.accessToken);
          } else {
            setState({
              isLoading: false,
              user: null,
              accessToken: null,
              organizationId: null,
            });
          }
        } catch {
          // Silent fail on background refresh
        }
      }, delay);
    },
    [fetchSession],
  );

  // Initial session load
  useEffect(() => {
    let cancelled = false;

    fetchSession().then((session) => {
      if (cancelled) return;

      if (session.user && session.accessToken) {
        setState({
          isLoading: false,
          user: session.user,
          accessToken: session.accessToken,
          organizationId: session.organizationId,
        });
        scheduleRefresh(session.accessToken);
      } else {
        setState({
          isLoading: false,
          user: null,
          accessToken: null,
          organizationId: null,
        });
      }
    });

    return () => {
      cancelled = true;
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [fetchSession, scheduleRefresh]);

  const signIn = useCallback((opts?: { organizationId?: string }) => {
    const params = new URLSearchParams();
    if (opts?.organizationId) {
      params.set("organization_id", opts.organizationId);
    }
    const qs = params.toString();
    window.location.href = `/api/auth/login${qs ? `?${qs}` : ""}`;
  }, []);

  const signOut = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    // Navigate to logout endpoint — it clears the cookie and redirects through
    // WorkOS to end the session there, then back to "/"
    window.location.href = "/api/auth/logout";
  }, []);

  const getAccessToken = useCallback(async (): Promise<string> => {
    // If we have a valid token that's not near expiry, return it
    if (state.accessToken) {
      const exp = parseJwtExp(state.accessToken);
      if (exp && exp - Date.now() > REFRESH_MARGIN_MS) {
        return state.accessToken;
      }
    }

    // Deduplicate concurrent refresh calls
    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = fetchSession().finally(() => {
        refreshPromiseRef.current = null;
      });
    }

    const session = await refreshPromiseRef.current;

    if (session.accessToken) {
      setState({
        isLoading: false,
        user: session.user,
        accessToken: session.accessToken,
        organizationId: session.organizationId,
      });
      scheduleRefresh(session.accessToken);
      return session.accessToken;
    }

    throw new Error("No access token available");
  }, [state.accessToken, fetchSession, scheduleRefresh]);

  const value: ServerAuthContextValue = {
    isLoading: state.isLoading,
    user: state.user,
    signIn,
    signOut,
    getAccessToken,
  };

  return (
    <ServerAuthContext.Provider value={value}>
      {children}
    </ServerAuthContext.Provider>
  );
}

export function useServerAuth(): ServerAuthContextValue {
  const ctx = useContext(ServerAuthContext);
  if (!ctx) {
    throw new Error("useServerAuth must be used within a ServerAuthProvider");
  }
  return ctx;
}
