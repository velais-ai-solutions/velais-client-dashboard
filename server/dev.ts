const required = [
  "WORKOS_API_KEY",
  "WORKOS_CLIENT_ID",
  "AZURE_DEVOPS_ORG",
  "AZURE_DEVOPS_PAT",
] as const;

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  console.error("Copy .env.example to .env and fill in the values.");
  process.exit(1);
}

// Dynamic import so env validation runs first
const { default: app } = await import("./app.js");

const port = Number(process.env.PORT ?? 3001);

console.log(`Hono API server running on http://localhost:${port}`);

export default {
  fetch: app.fetch,
  port,
};
