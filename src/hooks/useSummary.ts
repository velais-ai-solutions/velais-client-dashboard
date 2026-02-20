import type { SprintSummary } from "@shared/types/index.js";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.js";

export function useSummary() {
  return useQuery({
    queryKey: ["summary"],
    queryFn: () => api.get<SprintSummary>("/summary"),
  });
}
