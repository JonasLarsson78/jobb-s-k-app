<template>
  <div class="app">
    <FilterPanel @search="jobs.search()" />
    <main class="app__main">
      <div v-if="newVersion" class="app__update-banner">
        Ny version <strong>{{ newVersion }}</strong> är tillgänglig.
        <button @click="openReleasePage">Ladda ner</button>
        <button class="app__update-dismiss" @click="newVersion = null">✕</button>
      </div>

      <header class="app__header">
        <h1>Jobb</h1>
        <div class="app__stats">
          <span v-if="jobs.filteredJobs.length">{{ jobs.filteredJobs.length }} jobb</span>
          <button
            v-if="jobStatus.appliedCount"
            class="app__pill app__pill--applied"
            @click="jobStatus.showApplied = !jobStatus.showApplied"
          >
            <CheckCircle :size="11" />&nbsp;{{ jobStatus.showApplied ? "Dölj" : "Visa" }} {{ jobStatus.appliedCount }} sökt
          </button>
          <button
            v-if="jobStatus.ignoredCount"
            class="app__pill app__pill--ignored"
            @click="jobStatus.showIgnored = !jobStatus.showIgnored"
          >
            <EyeOff :size="11" />&nbsp;{{ jobStatus.showIgnored ? "Dölj" : "Visa" }} {{ jobStatus.ignoredCount }} ignorerade
          </button>
          <span v-if="jobs.errorAf" class="app__err-badge">AF: {{ jobs.errorAf }}</span>
          <span v-if="jobs.errorLi" class="app__err-badge">LinkedIn: {{ jobs.errorLi }}</span>
          <span v-if="jobs.errorJs" class="app__err-badge">JS: {{ jobs.errorJs }}</span>
        </div>
      </header>

      <div class="app__body">
        <div v-if="jobs.loading && jobs.filteredJobs.length === 0" class="app__loading">
          <div class="spinner" />
          <span>Hämtar jobb...</span>
        </div>

        <div v-else-if="!jobs.loading && jobs.filteredJobs.length === 0 && !jobs.errorAf && !jobs.errorLi" class="app__empty">
          Tryck på <strong>Sök</strong> för att hämta jobb.
        </div>

        <div v-else class="job-grid">
          <JobCard v-for="job in jobs.filteredJobs" :key="job.id" :job="job" @open="openModal" />
        </div>

        <div class="app__footer" v-if="jobs.filteredJobs.length > 0 || jobs.loading">
          <div v-if="jobs.loading" class="spinner-row">
            <div class="spinner" /><span>Laddar...</span>
          </div>
          <span v-else class="app__done">Alla jobb visas</span>
        </div>
      </div>
    </main>
  </div>

  <JobModal v-if="selectedJob" :job="selectedJob" @close="selectedJob = null" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import FilterPanel from "./components/FilterPanel.vue";
import JobCard from "./components/JobCard.vue";
import JobModal from "./components/JobModal.vue";
import { useJobsStore, type UnifiedJob } from "./stores/jobs";
import { useTaxonomyStore } from "./stores/taxonomy";
import { useJobStatusStore } from "./stores/jobStatus";
import { CheckCircle, EyeOff } from "lucide-vue-next";
import { useUpdateChecker } from "./composables/useUpdateChecker";

const { newVersion, openReleasePage } = useUpdateChecker();

const jobs = useJobsStore();
const taxonomy = useTaxonomyStore();
const jobStatus = useJobStatusStore();
const selectedJob = ref<UnifiedJob | null>(null);

function openModal(job: UnifiedJob) {
  selectedJob.value = job;
}

onMounted(async () => {
  await Promise.all([taxonomy.load(), jobStatus.init()]);
  jobs.search();
});
</script>

<style lang="scss">
.app {
  display: flex;
  height: 100vh;
  overflow: hidden;

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  &__update-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 18px;
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
    font-size: 13px;
    color: var(--text-primary);
    flex-shrink: 0;

    button {
      font-size: 12px;
      font-weight: 600;
      padding: 2px 10px;
      border-radius: 5px;
      border: 1px solid color-mix(in srgb, var(--accent) 50%, transparent);
      background: var(--accent);
      color: #fff;
      cursor: pointer;
      &:hover { opacity: 0.85; }
    }
  }

  &__update-dismiss {
    margin-left: auto;
    background: transparent !important;
    border: none !important;
    color: var(--text-secondary) !important;
    font-size: 14px !important;
    padding: 0 4px !important;
    &:hover { color: var(--text-primary) !important; opacity: 1 !important; }
  }

  &__header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    padding: 14px 18px 12px;
    border-bottom: 1px solid var(--border);
    background: var(--sidebar-bg);
    flex-shrink: 0;

    h1 { margin: 0; font-size: 17px; font-weight: 700; }
  }

  &__stats {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--text-secondary);
  }

  &__pill {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 20px;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;

    &--applied {
      background: color-mix(in srgb, #2e7d32 15%, transparent);
      color: #2e7d32;
      &:hover { background: color-mix(in srgb, #2e7d32 25%, transparent); }
    }

    &--ignored {
      background: var(--bg-secondary);
      color: var(--text-secondary);
      &:hover { color: var(--text-primary); }
    }
  }

  &__err-badge {
    font-size: 11px;
    background: #fef2f2;
    color: #c0392b;
    border: 1px solid #fecaca;
    border-radius: 4px;
    padding: 2px 7px;
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 14px 18px;
  }

  &__loading, &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    height: 200px;
    color: var(--text-secondary);
    font-size: 14px;
  }

  &__footer {
    display: flex;
    justify-content: center;
    gap: 10px;
    padding: 16px 0 6px;
  }

  &__done { font-size: 13px; color: var(--text-tertiary); }
}

.job-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 10px;
}

.btn-more {
  padding: 8px 18px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: var(--input-bg);
  color: var(--accent);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  &:hover { border-color: var(--accent); }
}

.spinner-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 13px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
