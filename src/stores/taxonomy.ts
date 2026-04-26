import { defineStore } from "pinia";
import { ref } from "vue";
import { fetchMunicipalities } from "../services/taxonomy";
import { MUNICIPALITIES_FALLBACK, searchMunicipalities, type Municipality } from "../data/municipalities";

export const useTaxonomyStore = defineStore("taxonomy", () => {
  const municipalities = ref<Municipality[]>(MUNICIPALITIES_FALLBACK);
  const loaded = ref(false);

  async function load() {
    if (loaded.value) return;
    try {
      municipalities.value = await fetchMunicipalities();
      loaded.value = true;
    } catch {
      // Behåller fallback-listan
    }
  }

  function search(query: string): Municipality[] {
    return searchMunicipalities(municipalities.value, query);
  }

  function byName(name: string): Municipality | null {
    return municipalities.value.find((m) => m.name === name) ?? null;
  }

  return { municipalities, load, search, byName };
});
