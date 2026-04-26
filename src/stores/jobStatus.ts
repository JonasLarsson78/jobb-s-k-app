import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { load } from "@tauri-apps/plugin-store";
import type { UnifiedJob } from "../types/job";

const STORE_FILE = "job-status.json";

async function getStore() {
  return load(STORE_FILE, { autoSave: true, defaults: {} });
}

export const useJobStatusStore = defineStore("jobStatus", () => {
  const applied = ref<Map<string, UnifiedJob>>(new Map());
  const ignored = ref<Map<string, UnifiedJob>>(new Map());
  const showIgnored = ref(false);
  const showApplied = ref(false);
  const ready = ref(false);

  function normalizeUrl(url: string): string {
    return url.split("?")[0];
  }

  async function init() {
    const store = await getStore();
    const a = await store.get<UnifiedJob[]>("applied");
    const i = await store.get<UnifiedJob[]>("ignored");
    if (a) applied.value = new Map(a.map((j) => [normalizeUrl(j.url), { ...j, url: normalizeUrl(j.url) }]));
    if (i) ignored.value = new Map(i.map((j) => [normalizeUrl(j.url), { ...j, url: normalizeUrl(j.url) }]));
    ready.value = true;
  }

  async function persist() {
    const store = await getStore();
    await store.set("applied", [...applied.value.values()]);
    await store.set("ignored", [...ignored.value.values()]);
  }

  function toggleApplied(job: UnifiedJob) {
    if (applied.value.has(job.url)) {
      applied.value.delete(job.url);
    } else {
      applied.value.set(job.url, job);
      ignored.value.delete(job.url);
    }
    applied.value = new Map(applied.value);
    ignored.value = new Map(ignored.value);
    persist();
  }

  function toggleIgnored(job: UnifiedJob) {
    if (ignored.value.has(job.url)) {
      ignored.value.delete(job.url);
    } else {
      ignored.value.set(job.url, job);
      applied.value.delete(job.url);
    }
    ignored.value = new Map(ignored.value);
    applied.value = new Map(applied.value);
    persist();
  }

  function isApplied(url: string) { return applied.value.has(url); }
  function isIgnored(url: string) { return ignored.value.has(url); }

  const appliedJobs = computed(() => [...applied.value.values()]);
  const ignoredJobs = computed(() => [...ignored.value.values()]);
  const appliedCount = computed(() => applied.value.size);
  const ignoredCount = computed(() => ignored.value.size);

  return {
    applied, ignored, showIgnored, showApplied, ready,
    isApplied, isIgnored,
    toggleApplied, toggleIgnored,
    appliedJobs, ignoredJobs,
    appliedCount, ignoredCount,
    init,
  };
});
