import type { ClientStory } from "@shared/types/index.js";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api.js";
import { useTenant } from "../lib/tenant.js";

export function useStories(options?: { enabled?: boolean }) {
  const tenant = useTenant();

  return useQuery({
    queryKey: ["stories", tenant?.slug ?? "default"],
    queryFn: () => api.get<ClientStory[]>("/stories"),
    enabled: options?.enabled,
  });
}
