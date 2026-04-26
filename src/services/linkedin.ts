import { invoke } from "@tauri-apps/api/core";

export interface LinkedInJob {
  id: string;
  title: string;
  company: string;
  location: string;
  publishedAt: string;
  url: string;
  logoUrl?: string;
}

export async function searchLinkedIn(params: {
  keywords: string;
  location: string;
  geoId?: string;
  distance: number;
  start: number;
  maxAge?: number;
}): Promise<LinkedInJob[]> {
  const query = new URLSearchParams({
    keywords: params.keywords,
    location: params.location,
    distance: String(params.distance),
    start: String(params.start),
    sortBy: "DD",
  });
  if (params.geoId) query.set("geoId", params.geoId);

  if (params.maxAge) {
    const seconds = params.maxAge * 86400;
    query.set("f_TPR", `r${seconds}`);
  }

  const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?${query}`;
  const html: string = await invoke("fetch_url", { url });

  return parseLinkedInHtml(html);
}

function parseLinkedInHtml(html: string): LinkedInJob[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const cards = doc.querySelectorAll(".base-card");
  const jobs: LinkedInJob[] = [];

  cards.forEach((card) => {
    const urn = card.getAttribute("data-entity-urn") ?? "";
    const id = urn.split(":").pop() ?? Math.random().toString();

    const titleEl = card.querySelector(".base-search-card__title");
    const companyEl = card.querySelector(".base-search-card__subtitle");
    const locationEl = card.querySelector(".job-search-card__location");
    const timeEl = card.querySelector("time");
    const linkEl = card.querySelector("a.base-card__full-link");
    const imgEl =
      card.querySelector(".search-entity-media img") ??
      card.querySelector(".base-search-card__figure img");

    const title = titleEl?.textContent?.trim() ?? "";
    const company = companyEl?.textContent?.trim() ?? "";
    const location = locationEl?.textContent?.trim() ?? "";
    const publishedAt = timeEl?.getAttribute("datetime") ?? new Date().toISOString();
    const rawUrl = linkEl?.getAttribute("href") ?? "";
    const url = rawUrl ? rawUrl.split("?")[0] : "";
    const logoRaw =
      imgEl?.getAttribute("data-delayed-url") ||
      imgEl?.getAttribute("src") ||
      undefined;
    const validLogo = logoRaw && !logoRaw.startsWith("data:") ? logoRaw : undefined;

    if (title) {
      jobs.push({ id, title, company, location, publishedAt, url, logoUrl: validLogo ?? undefined });
    }
  });

  return jobs;
}
