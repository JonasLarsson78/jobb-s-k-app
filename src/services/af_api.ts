const BASE = "https://jobsearch.api.jobtechdev.se";

export interface AfJob {
  id: string;
  headline: string;
  publication_date: string;
  application_deadline: string | null;
  description: { text: string; text_formatted?: string } | null;
  employer: { name: string; workplace: string | null } | null;
  workplace_address: {
    municipality: string | null;
    region: string | null;
    city: string | null;
  } | null;
  application: { webaddress: string | null; email: string | null } | null;
  logo_url: string | null;
  webpage_url: string;
  employment_type: { label: string } | null;
}

export interface AfResponse {
  total: { value: number };
  hits: AfJob[];
}

export async function searchAf(params: {
  q: string;
  publishedAfter?: string;
  offset?: number;
  limit?: number;
  municipality?: string;
}): Promise<AfResponse> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.publishedAfter) query.set("published-after", params.publishedAfter);
  if (params.municipality) query.set("municipality", params.municipality);
  query.set("offset", String(params.offset ?? 0));
  query.set("limit", String(params.limit ?? 20));

  const res = await fetch(`${BASE}/search?${query}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`AF API-fel ${res.status}`);
  return res.json();
}
