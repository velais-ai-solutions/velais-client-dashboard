const org = encodeURIComponent(process.env.AZURE_DEVOPS_ORG ?? "");
const pat = process.env.AZURE_DEVOPS_PAT ?? "";
const authHeader = `Basic ${Buffer.from(`:${pat}`).toString("base64")}`;

// Azure Work Items API hard limit per batch request
const AZURE_BATCH_SIZE = 200;

const AZURE_TIMEOUT_MS = 30_000;

/** Escape single quotes for safe WIQL string interpolation. */
function wiqlEscape(value: string): string {
  return value.replace(/'/g, "''");
}

export interface AzureIteration {
  id: string;
  name: string;
  path: string;
  attributes: {
    startDate: string;
    finishDate: string;
    timeFrame: string;
  };
}

interface WiqlResponse {
  workItems: Array<{ id: number; url: string }>;
}

export interface AzureWorkItem {
  id: number;
  fields: Record<string, unknown>;
}

async function azureFetch<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AZURE_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "(no body)");
    console.error(
      `[azure] GET ${res.status} ${res.statusText} | Path: ${new URL(url).pathname} | Body: ${body.slice(0, 500)}`,
    );
    throw new Error(`Azure DevOps API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

async function azurePost<T>(url: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AZURE_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const resBody = await res.text().catch(() => "(no body)");
    console.error(
      `[azure] POST ${res.status} ${res.statusText} | Path: ${new URL(url).pathname} | Body: ${resBody.slice(0, 500)}`,
    );
    throw new Error(`Azure DevOps API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function getCurrentIteration(
  project: string,
  team: string,
): Promise<AzureIteration | null> {
  const encodedProject = encodeURIComponent(project);
  const encodedTeam = encodeURIComponent(team);
  const url = `https://dev.azure.com/${org}/${encodedProject}/${encodedTeam}/_apis/work/teamsettings/iterations?api-version=7.1`;

  const data = await azureFetch<{ value: AzureIteration[] }>(url);
  const iterations = data.value ?? [];
  const now = new Date();

  // Prefer iteration whose date range covers today
  const byDate = iterations.find((iter) => {
    if (!iter.attributes.startDate || !iter.attributes.finishDate) return false;
    const start = new Date(iter.attributes.startDate);
    const end = new Date(iter.attributes.finishDate);
    return now >= start && now <= end;
  });
  if (byDate) return byDate;

  // Fallback: iteration Azure DevOps marks as "current"
  const byTimeFrame = iterations.find(
    (iter) => iter.attributes.timeFrame === "current",
  );
  if (byTimeFrame) return byTimeFrame;

  // Last resort: return the most recent iteration
  return iterations.at(-1) ?? null;
}

export async function queryWorkItems(
  project: string,
  iterationPath: string,
): Promise<number[]> {
  const encodedProject = encodeURIComponent(project);
  const url = `https://dev.azure.com/${org}/${encodedProject}/_apis/wit/wiql?api-version=7.1`;

  const wiql = `
    SELECT [System.Id]
    FROM WorkItems
    WHERE [System.TeamProject] = '${wiqlEscape(project)}'
      AND [System.WorkItemType] IN ('User Story', 'Bug')
      AND [System.IterationPath] UNDER '${wiqlEscape(iterationPath)}'
    ORDER BY [Microsoft.VSTS.Common.Priority] ASC, [System.ChangedDate] DESC
  `;

  const data = await azurePost<WiqlResponse>(url, { query: wiql });
  return (data.workItems ?? []).map((wi) => wi.id);
}

export async function getWorkItemDetails(
  ids: number[],
): Promise<AzureWorkItem[]> {
  if (ids.length === 0) return [];

  const fields = [
    "System.Id",
    "System.WorkItemType",
    "System.Title",
    "System.State",
    "System.AssignedTo",
    "Microsoft.VSTS.Scheduling.Effort",
    "Microsoft.VSTS.Common.Priority",
    "System.Tags",
    "System.ChangedDate",
    "Microsoft.VSTS.Scheduling.TargetDate",
  ].join(",");

  const batches: Promise<AzureWorkItem[]>[] = [];
  for (let i = 0; i < ids.length; i += AZURE_BATCH_SIZE) {
    const batch = ids.slice(i, i + AZURE_BATCH_SIZE);
    const url = `https://dev.azure.com/${org}/_apis/wit/workitems?ids=${batch.join(",")}&fields=${fields}&api-version=7.1`;
    batches.push(
      azureFetch<{ value: AzureWorkItem[] }>(url).then((d) => d.value ?? []),
    );
  }

  return (await Promise.all(batches)).flat();
}
