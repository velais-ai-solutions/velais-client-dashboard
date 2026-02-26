import type { SprintSummary } from "@shared/types/index.js";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import { useTenant } from "../lib/tenant.js";

export function useSummary(options?: { enabled?: boolean }) {
  const tenant = useTenant();

  return useQuery({
    queryKey: ["summary", tenant?.slug ?? "default"],
    queryFn: () => api.get<SprintSummary>("/summary"),
    enabled: options?.enabled,
  });
}
