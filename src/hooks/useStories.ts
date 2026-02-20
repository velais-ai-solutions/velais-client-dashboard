import type { ClientStory } from "@shared/types/index.js";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.js";

export function useStories(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["stories"],
    queryFn: () => api.get<ClientStory[]>("/stories"),
    enabled: options?.enabled,
  });
}
