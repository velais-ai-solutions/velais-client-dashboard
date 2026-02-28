import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import { ServerAuthProvider } from "./lib/auth.js";
import { queryClient } from "./lib/query-client.js";
import { TenantProvider } from "./lib/tenant.js";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TenantProvider>
      <ServerAuthProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ServerAuthProvider>
    </TenantProvider>
  </StrictMode>,
);
