import type { ClientStory } from "@shared/types/index.js";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.js";

export function useStories() {
  return useQuery({
    queryKey: ["stories"],
    queryFn: () => api.get<ClientStory[]>("/stories"),
  });
}
