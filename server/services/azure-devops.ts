const org = process.env.AZURE_DEVOPS_ORG ?? "";
const pat = process.env.AZURE_DEVOPS_PAT ?? "";
const authHeader = `Basic ${Buffer.from(`:${pat}`).toString("base64")}`;

interface AzureIteration {
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

interface AzureWorkItem {
  id: number;
  fields: Record<string, unknown>;
}

async function azureFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "(no body)");
    throw new Error(
      `Azure DevOps API error: ${res.status} ${res.statusText} | URL: ${url} | Body: ${body}`,
    );
  }

  return res.json() as Promise<T>;
}

async function azurePost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const resBody = await res.text().catch(() => "(no body)");
    throw new Error(
      `Azure DevOps API error: ${res.status} ${res.statusText} | URL: ${url} | Body: ${resBody}`,
    );
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
  const now = new Date();

  // Prefer iteration whose date range covers today
  const byDate = data.value.find((iter) => {
    if (!iter.attributes.startDate || !iter.attributes.finishDate) return false;
    const start = new Date(iter.attributes.startDate);
    const end = new Date(iter.attributes.finishDate);
    return now >= start && now <= end;
  });
  if (byDate) return byDate;

  // Fallback: iteration Azure DevOps marks as "current"
  const byTimeFrame = data.value.find(
    (iter) => iter.attributes.timeFrame === "current",
  );
  if (byTimeFrame) return byTimeFrame;

  // Last resort: return the most recent iteration
  return data.value.at(-1) ?? null;
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
    WHERE [System.TeamProject] = '${project}'
      AND [System.WorkItemType] = 'User Story'
      AND [System.IterationPath] UNDER '${iterationPath}'
    ORDER BY [Microsoft.VSTS.Common.Priority] ASC, [System.ChangedDate] DESC
  `;

  const data = await azurePost<WiqlResponse>(url, { query: wiql });
  return data.workItems.map((wi) => wi.id);
}

export async function getWorkItemDetails(
  ids: number[],
): Promise<AzureWorkItem[]> {
  if (ids.length === 0) return [];

  const batchSize = 200;
  const results: AzureWorkItem[] = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const fields = [
      "System.Id",
      "System.Title",
      "System.State",
      "System.AssignedTo",
      "Microsoft.VSTS.Scheduling.Effort",
      "Microsoft.VSTS.Common.Priority",
      "System.Tags",
      "System.ChangedDate",
      "Microsoft.VSTS.Scheduling.TargetDate",
    ].join(",");

    const url = `https://dev.azure.com/${org}/_apis/wit/workitems?ids=${batch.join(",")}&fields=${fields}&api-version=7.1`;
    const data = await azureFetch<{ value: AzureWorkItem[] }>(url);
    results.push(...data.value);
  }

  return results;
}
