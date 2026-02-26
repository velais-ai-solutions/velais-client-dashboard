import { QueryClientProvider } from "@tanstack/react-query";
import { AuthKitProvider } from "@workos-inc/authkit-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import { queryClient } from "./lib/query-client.js";
import { TenantProvider } from "./lib/tenant.js";
import "./index.css";

const clientId = import.meta.env.VITE_WORKOS_CLIENT_ID;
if (!clientId) {
  throw new Error(
    "VITE_WORKOS_CLIENT_ID is not set. Add it to your .env file.",
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TenantProvider>
      <AuthKitProvider
        clientId={clientId}
        redirectUri={`${window.location.origin}/callback`}
        devMode={import.meta.env.DEV}
      >
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </AuthKitProvider>
    </TenantProvider>
  </StrictMode>,
);
