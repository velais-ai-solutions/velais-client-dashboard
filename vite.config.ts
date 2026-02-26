import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  server: {
    // Allow *.lvh.me subdomains for local multi-tenant development
    allowedHosts: [".lvh.me", "localhost"],
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        // Preserve original Host header so backend can extract subdomain
        changeOrigin: false,
      },
    },
  },
});
