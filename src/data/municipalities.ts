export interface Municipality {
  name: string;
  afCode: string;
  linkedinGeoId?: string;
}

// LinkedIn geoIds för svenska orter (hämtade från LinkedIn-URL:er)
export const LINKEDIN_GEOIDS: Record<string, string> = {
  "Stockholm":      "106028526",
  "Göteborg":       "104024930",
  "Malmö":          "102839516",
  "Uppsala":        "106028492",
  "Linköping":      "101748551",
  "Helsingborg":    "105519847",
  "Örebro":         "101748441",
  "Västerås":       "101748564",
  "Norrköping":     "101748550",
  "Jönköping":      "101748506",
  "Umeå":           "101748561",
  "Lund":           "101748535",
  "Borås":          "101748468",
  "Sundsvall":      "101748557",
  "Gävle":          "101748490",
  "Eskilstuna":     "101748482",
  "Karlstad":       "101748507",
  "Halmstad":       "101748493",
  "Luleå":          "101748534",
  "Växjö":          "101748567",
  "Solna":          "104624750",
  "Södertälje":     "101748559",
  "Kristianstad":   "101748528",
  "Trollhättan":    "101748560",
  "Östersund":      "101748568",
  "Skellefteå":     "101748553",
  "Kalmar":         "101748505",
  "Falun":          "101748484",
  "Karlskrona":     "101748508",
  "Uddevalla":      "101748562",
};

// Används bara som fallback om API-anropet misslyckas
export const MUNICIPALITIES_FALLBACK: Municipality[] = [
  { name: "Hela Sverige",  afCode: "" },
  { name: "Stockholm",     afCode: "0180", linkedinGeoId: LINKEDIN_GEOIDS["Stockholm"] },
  { name: "Göteborg",      afCode: "1480", linkedinGeoId: LINKEDIN_GEOIDS["Göteborg"] },
  { name: "Malmö",         afCode: "1280", linkedinGeoId: LINKEDIN_GEOIDS["Malmö"] },
  { name: "Uppsala",       afCode: "0380", linkedinGeoId: LINKEDIN_GEOIDS["Uppsala"] },
  { name: "Linköping",     afCode: "0580", linkedinGeoId: LINKEDIN_GEOIDS["Linköping"] },
  { name: "Helsingborg",   afCode: "1283", linkedinGeoId: LINKEDIN_GEOIDS["Helsingborg"] },
  { name: "Örebro",        afCode: "1880", linkedinGeoId: LINKEDIN_GEOIDS["Örebro"] },
  { name: "Västerås",      afCode: "1980", linkedinGeoId: LINKEDIN_GEOIDS["Västerås"] },
  { name: "Norrköping",    afCode: "0581", linkedinGeoId: LINKEDIN_GEOIDS["Norrköping"] },
  { name: "Jönköping",     afCode: "0680", linkedinGeoId: LINKEDIN_GEOIDS["Jönköping"] },
  { name: "Umeå",          afCode: "2480", linkedinGeoId: LINKEDIN_GEOIDS["Umeå"] },
  { name: "Lund",          afCode: "1281", linkedinGeoId: LINKEDIN_GEOIDS["Lund"] },
  { name: "Borås",         afCode: "1490", linkedinGeoId: LINKEDIN_GEOIDS["Borås"] },
  { name: "Sundsvall",     afCode: "2281", linkedinGeoId: LINKEDIN_GEOIDS["Sundsvall"] },
  { name: "Gävle",         afCode: "2180", linkedinGeoId: LINKEDIN_GEOIDS["Gävle"] },
  { name: "Eskilstuna",    afCode: "0484", linkedinGeoId: LINKEDIN_GEOIDS["Eskilstuna"] },
  { name: "Karlstad",      afCode: "1780", linkedinGeoId: LINKEDIN_GEOIDS["Karlstad"] },
  { name: "Halmstad",      afCode: "1380", linkedinGeoId: LINKEDIN_GEOIDS["Halmstad"] },
  { name: "Luleå",         afCode: "2580", linkedinGeoId: LINKEDIN_GEOIDS["Luleå"] },
  { name: "Växjö",         afCode: "0780", linkedinGeoId: LINKEDIN_GEOIDS["Växjö"] },
];

export function searchMunicipalities(list: Municipality[], query: string): Municipality[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return list
    .filter((m) => m.name.toLowerCase().startsWith(q) || m.name.toLowerCase().includes(q))
    .slice(0, 8);
}
