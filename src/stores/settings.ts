import { defineStore } from "pinia";
import { ref } from "vue";
import { MUNICIPALITIES_FALLBACK, type Municipality } from "../data/municipalities";

const KEY = "jobb-settings-v5";

interface Stored {
  excludeWords: string[];
  maxAge: number;
  query: string;
  cityNames: string[];
  cities?: Municipality[];
  linkedinDistance: number;
  afEnabled: boolean;
  linkedinEnabled: boolean;
  jobbsafariEnabled: boolean;
}

function defaults(): Stored {
  return {
    excludeWords: [],
    maxAge: 30,
    query: "frontend",
    cityNames: ["Helsingborg"],
    linkedinDistance: 10,
    afEnabled: true,
    linkedinEnabled: true,
    jobbsafariEnabled: true,
  };
}

function load(): Stored {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) };
  } catch {}
  return defaults();
}

function resolveCities(s: Stored): Municipality[] {
  if (s.cities && s.cities.length > 0) return s.cities;
  // Bakåtkompatibilitet: gamla format med bara namn
  return s.cityNames
    .map((name) => MUNICIPALITIES_FALLBACK.find((m) => m.name === name) ?? null)
    .filter(Boolean) as Municipality[];
}

export const useSettingsStore = defineStore("settings", () => {
  const s = load();

  const excludeWords = ref<string[]>(s.excludeWords);
  const maxAge = ref(s.maxAge);
  const query = ref(s.query);
  const cities = ref<Municipality[]>(resolveCities(s));
  const linkedinDistance = ref(s.linkedinDistance);
  const afEnabled = ref(s.afEnabled);
  const linkedinEnabled = ref(s.linkedinEnabled);
  const jobbsafariEnabled = ref(s.jobbsafariEnabled);

  function persist() {
    localStorage.setItem(KEY, JSON.stringify({
      excludeWords: excludeWords.value,
      maxAge: maxAge.value,
      query: query.value,
      cityNames: cities.value.map((c) => c.name),
      cities: cities.value,
      linkedinDistance: linkedinDistance.value,
      afEnabled: afEnabled.value,
      linkedinEnabled: linkedinEnabled.value,
      jobbsafariEnabled: jobbsafariEnabled.value,
    }));
  }

  function addCity(city: Municipality) {
    if (!cities.value.find((c) => c.afCode === city.afCode && c.name === city.name)) {
      cities.value.push(city);
      persist();
    }
  }

  function removeCity(city: Municipality) {
    cities.value = cities.value.filter((c) => c.name !== city.name);
    persist();
  }

  function addExcludeWord(word: string) {
    const w = word.trim().toLowerCase();
    if (w && !excludeWords.value.includes(w)) {
      excludeWords.value.push(w);
      persist();
    }
  }

  function removeExcludeWord(word: string) {
    excludeWords.value = excludeWords.value.filter((w) => w !== word);
    persist();
  }

  function setMaxAge(days: number) {
    maxAge.value = days;
    persist();
  }

  return {
    excludeWords, maxAge,
    query, cities,
    linkedinDistance,
    afEnabled, linkedinEnabled, jobbsafariEnabled,
    addCity, removeCity,
    addExcludeWord, removeExcludeWord, setMaxAge, persist,
  };
});
