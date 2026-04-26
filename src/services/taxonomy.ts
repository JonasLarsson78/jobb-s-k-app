import type { Municipality } from "../data/municipalities";
import { LINKEDIN_GEOIDS } from "../data/municipalities";

interface TaxonomyItem {
  "taxonomy/lau-2-code-2015": string;
  "taxonomy/preferred-label": string;
}

let cached: Municipality[] | null = null;

export async function fetchMunicipalities(): Promise<Municipality[]> {
  if (cached) return cached;

  const res = await fetch(
    "https://taxonomy.api.jobtechdev.se/v1/taxonomy/specific/concepts/municipality"
  );
  if (!res.ok) throw new Error(`Taxonomy API ${res.status}`);

  const data: TaxonomyItem[] = await res.json();

  cached = data.map((item) => ({
    name: item["taxonomy/preferred-label"],
    afCode: item["taxonomy/lau-2-code-2015"],
    linkedinGeoId: LINKEDIN_GEOIDS[item["taxonomy/preferred-label"]],
  }));

  // Lägg till "Hela Sverige" i toppen
  cached.unshift({ name: "Hela Sverige", afCode: "" });

  return cached;
}
