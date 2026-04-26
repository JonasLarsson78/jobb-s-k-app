import { invoke } from "@tauri-apps/api/core";

export interface JobDetail {
  description?: string;
  employmentType?: string;
  deadline?: string;
}

export async function fetchJobDetail(url: string, source: string): Promise<JobDetail> {
  if (source === "af") return {}; // AF-beskrivning finns redan i store

  try {
    const html: string = await invoke("fetch_url", { url: toDetailUrl(url, source) });
    return parseDetail(html);
  } catch {
    return {};
  }
}

function toDetailUrl(url: string, source: string): string {
  if (source === "jobbsafari") {
    // JobbSafari-URL:er pekar redan på jobbsafari.se/jobb/...
    // men apply-URL:en kan peka externt — försök hitta js-sidan via slug
    if (url.includes("jobbsafari.se")) return url;
    return url;
  }
  return url;
}

function parseDetail(html: string): JobDetail {
  // Försök JSON-LD JobPosting
  const match = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
  if (match) {
    for (const tag of match) {
      try {
        const inner = tag.replace(/<script[^>]*>/, "").replace(/<\/script>/, "");
        const data = JSON.parse(inner);
        const posting = findJobPosting(data);
        if (posting) {
          return {
            description: cleanHtml(posting.description ?? ""),
            employmentType: posting.employmentType,
            deadline: posting.validThrough,
          };
        }
      } catch {}
    }
  }

  // Fallback: og:description
  const og = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/);
  if (og) return { description: og[1] };

  return {};
}

function findJobPosting(data: unknown): Record<string, string> | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;
  if (obj["@type"] === "JobPosting") return obj as Record<string, string>;
  for (const v of Object.values(obj)) {
    const found = findJobPosting(v);
    if (found) return found;
  }
  return null;
}

function cleanHtml(html: string): string {
  return html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}
