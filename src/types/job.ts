export type Source = "af" | "linkedin" | "jobbsafari";

export interface UnifiedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  publishedAt: string;
  url: string;
  source: Source;
  logoUrl?: string;
  description?: string;
  employmentType?: string;
}
