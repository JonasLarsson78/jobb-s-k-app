<template>
  <aside class="filter-panel">

    <!-- Sök -->
    <section class="filter-panel__section">
      <h4><Search :size="11" class="section-icon" />Sökord</h4>
      <input
        v-model="settings.query"
        type="text"
        placeholder="t.ex. frontend"
        class="input"
        @change="settings.persist()"
        @keydown.enter="emit('search')"
      />
      <button class="btn-search" @click="emit('search')"><Search :size="14" style="margin-right:5px" />Sök</button>
    </section>

    <!-- Orter -->
    <section class="filter-panel__section">
      <h4><MapPin :size="11" class="section-icon" />Orter</h4>
      <CitySelect v-model="pendingCity" placeholder="Lägg till ort..." @update:model-value="addCity" />
      <ul class="chip-list" v-if="settings.cities.length">
        <li v-for="city in settings.cities" :key="city.name" class="chip">
          <span>{{ city.name }}</span>
          <button @click="settings.removeCity(city)"><X :size="11" /></button>
        </li>
      </ul>
      <span v-else class="chip-list__empty">Söker i hela Sverige</span>
    </section>

    <!-- Källor -->
    <section class="filter-panel__section">
      <h4><Database :size="11" class="section-icon" />Källor</h4>
      <label class="source-toggle">
        <input type="checkbox" v-model="settings.afEnabled" @change="settings.persist()" />
        <span class="source-toggle__label source-toggle__label--af">Arbetsförmedlingen</span>
      </label>
      <label class="source-toggle">
        <input type="checkbox" v-model="settings.linkedinEnabled" @change="settings.persist()" />
        <span class="source-toggle__label source-toggle__label--li">LinkedIn</span>
      </label>
      <label class="source-toggle">
        <input type="checkbox" v-model="settings.jobbsafariEnabled" @change="settings.persist()" />
        <span class="source-toggle__label source-toggle__label--js">JobbSafari</span>
      </label>
      <div v-if="settings.linkedinEnabled" class="distance-row">
        <span class="input-label">Avstånd (km)</span>
        <input v-model.number="settings.linkedinDistance" type="number" min="0" max="200" class="input input--sm" @change="settings.persist()" />
      </div>
    </section>

    <!-- Datum -->
    <section class="filter-panel__section">
      <h4><Calendar :size="11" class="section-icon" />Publicerad inom</h4>
      <div class="age-grid">
        <button v-for="opt in ageOptions" :key="opt.value"
          class="age-btn" :class="{ active: settings.maxAge === opt.value }"
          @click="settings.setMaxAge(opt.value)">
          {{ opt.label }}
        </button>
      </div>
    </section>

    <!-- Filtrera bort ord -->
    <section class="filter-panel__section">
      <h4><EyeOff :size="11" class="section-icon" />Filtrera bort ord</h4>
      <div class="exclude-row">
        <input v-model="newWord" type="text" placeholder="Lägg till ord..." class="input" @keydown.enter="addWord" />
        <button class="btn-icon" @click="addWord" :disabled="!newWord.trim()"><Plus :size="14" /></button>
      </div>
      <ul class="chip-list">
        <li v-for="word in settings.excludeWords" :key="word" class="chip">
          <span>{{ word }}</span>
          <button @click="settings.removeExcludeWord(word)"><X :size="11" /></button>
        </li>
        <li v-if="!settings.excludeWords.length" class="chip-list__empty">Inga ord ännu</li>
      </ul>
    </section>

  </aside>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useSettingsStore } from "../stores/settings";
import CitySelect from "./CitySelect.vue";
import type { Municipality } from "../data/municipalities";
import { Search, MapPin, Database, Calendar, EyeOff, Plus, X } from "lucide-vue-next";

const emit = defineEmits<{ search: [] }>();
const settings = useSettingsStore();
const newWord = ref("");
const pendingCity = ref<Municipality | null>(null);

function addCity(city: Municipality | null) {
  if (city) {
    settings.addCity(city);
    pendingCity.value = null;
  }
}

const ageOptions = [
  { label: "1 dag", value: 1 },
  { label: "7 dagar", value: 7 },
  { label: "30 dagar", value: 30 },
  { label: "90 dagar", value: 90 },
];

function addWord() {
  if (newWord.value.trim()) {
    settings.addExcludeWord(newWord.value);
    newWord.value = "";
  }
}
</script>

<style lang="scss" scoped>
.filter-panel {
  width: 220px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 16px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border);
  overflow-y: auto;

  &__section {
    display: flex;
    flex-direction: column;
    gap: 7px;

    h4 {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-secondary);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 5px;
    }
  }
}

.input {
  width: 100%;
  padding: 6px 9px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 12px;
  outline: none;
  box-sizing: border-box;
  &:focus { border-color: var(--accent); }
  &--sm { width: 70px; }
}

.source-toggle {
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  user-select: none;

  input[type="checkbox"] {
    width: 14px;
    height: 14px;
    accent-color: var(--accent);
    cursor: pointer;
  }

  &__label {
    font-size: 12px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 4px;
    &--af { background: #e8f5e9; color: #2e7d32; }
    &--li { background: #e3f2fd; color: #0077b5; }
    &--js { background: #fff3e0; color: #e65100; }
  }
}

@media (prefers-color-scheme: dark) {
  .source-toggle__label--af { background: rgba(46,125,50,.2); color: #66bb6a; }
  .source-toggle__label--li { background: rgba(0,119,181,.2); color: #42a5f5; }
  .source-toggle__label--js { background: rgba(230,81,0,.2); color: #ffa040; }
}

.distance-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 21px;
}

.input-label {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.age-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
}

.age-btn {
  padding: 5px 0;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.1s;
  &.active { background: var(--accent); color: #fff; border-color: var(--accent); }
  &:hover:not(.active) { border-color: var(--accent); color: var(--accent); }
}

.exclude-row {
  display: flex;
  gap: 5px;
  .input { flex: 1; }
}

.btn-icon {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  color: var(--accent);
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  &:disabled { opacity: 0.4; cursor: default; }
}

.chip-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  &__empty { font-size: 11px; color: var(--text-tertiary); }
}

.chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-secondary);
  border-radius: 5px;
  padding: 3px 8px;
  font-size: 12px;

  button {
    background: none;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    font-size: 15px;
    padding: 0 0 0 6px;
    &:hover { color: #e74c3c; }
  }
}

.btn-search {
  padding: 9px;
  border-radius: 7px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { opacity: 0.85; }
}
</style>
