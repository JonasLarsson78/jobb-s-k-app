import { invoke } from "@tauri-apps/api/core";

export interface JobbSafariJob {
  id: string;
  title: string;
  company: string;
  location: string;
  publishedAt: string;
  url: string;
  logoUrl?: string;
}

function toSlug(city: string): string {
  return city
    .toLowerCase()
    .replace(/å/g, "a")
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/\s+/g, "-");
}

interface RawJob {
  pk: number;
  title: string;
  slug: string;
  startDate: string;
  company: { name: string; logoUrl?: string };
  locations: Array<{ name: string }>;
  apply?: { href?: string };
  logoUrl?: string | null;
}

export async function searchJobbSafari(params: {
  keywords: string;
  city: string;
}): Promise<JobbSafariJob[]> {
  const citySlug = toSlug(params.city);
  const url = `https://jobbsafari.se/lediga-jobb/ort/${citySlug}?sok=${encodeURIComponent(params.keywords)}`;

  const html: string = await invoke("fetch_url", { url });
  return parseJobbSafari(html);
}

function parseJobbSafari(html: string): JobbSafariJob[] {
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) return [];

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(match[1]);
  } catch {
    return [];
  }

  const jobEntries = (data as { props?: { pageProps?: { jobEntries?: Record<string, RawJob[]> } } })
    ?.props?.pageProps?.jobEntries;

  if (!jobEntries) return [];

  const jobs: JobbSafariJob[] = [];

  for (const group of Object.values(jobEntries)) {
    if (!Array.isArray(group)) continue;
    for (const job of group) {
      const applyUrl = job.apply?.href ?? `https://jobbsafari.se/jobb/${job.slug}`;
      const location = job.locations?.[0]?.name ?? "";
      const logoUrl = job.logoUrl || job.company?.logoUrl || undefined;

      jobs.push({
        id: String(job.pk),
        title: job.title,
        company: job.company?.name ?? "",
        location,
        publishedAt: job.startDate,
        url: applyUrl,
        logoUrl: logoUrl || undefined,
      });
    }
  }

  return jobs;
}
