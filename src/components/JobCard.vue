<template>
  <article
    class="job-card"
    :class="{
      'job-card--applied': status.isApplied(job.url),
      'job-card--ignored': status.isIgnored(job.url),
    }"
    @click="emit('open', job)"
  >
    <div class="job-card__header">
      <img v-if="job.logoUrl" :src="job.logoUrl" :alt="job.company" class="job-card__logo" />
      <div v-else class="job-card__logo-placeholder">{{ initial }}</div>
      <div class="job-card__meta">
        <span class="job-card__company">{{ job.company }}</span>
        <span class="job-card__location"><MapPin :size="10" class="inline-icon" />{{ job.location }}</span>
      </div>
      <div class="job-card__right">
        <span class="source-badge" :class="`source-badge--${job.source}`">
          {{ job.source === "af" ? "AF" : job.source === "linkedin" ? "in" : "JS" }}
        </span>
        <span class="job-card__age"><Clock :size="10" class="inline-icon" />{{ ageText }}</span>
      </div>
    </div>

    <h3 class="job-card__title">{{ job.title }}</h3>
    <p v-if="job.employmentType" class="job-card__type">{{ job.employmentType }}</p>

    <div class="job-card__status">
      <span v-if="status.isApplied(job.url)" class="status-chip status-chip--applied"><CheckCircle :size="10" class="inline-icon" />Sökt</span>
      <span v-if="status.isIgnored(job.url)" class="status-chip status-chip--ignored"><EyeOff :size="10" class="inline-icon" />Ignorerad</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { UnifiedJob } from "../stores/jobs";
import { useJobStatusStore } from "../stores/jobStatus";
import { MapPin, Clock, CheckCircle, EyeOff } from "lucide-vue-next";

const props = defineProps<{ job: UnifiedJob }>();
const emit = defineEmits<{ open: [job: UnifiedJob] }>();
const status = useJobStatusStore();

const initial = computed(() => props.job.company?.[0]?.toUpperCase() ?? "?");

const ageText = computed(() => {
  const d = new Date(props.job.publishedAt);
  if (isNaN(d.getTime())) return "";
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 0) return "Idag";
  if (diff === 1) return "1 dag";
  return `${diff} dagar`;
});
</script>

<style lang="scss" scoped>
.job-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, opacity 0.15s;
  position: relative;

  &:hover {
    border-color: var(--accent);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

    .job-card__actions {
      opacity: 1;
    }
  }

  &--applied {
    border-color: #2e7d32;
    background: color-mix(in srgb, var(--card-bg) 95%, #2e7d32);
  }

  &--ignored {
    opacity: 0.45;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  &__logo {
    width: 34px;
    height: 34px;
    border-radius: 6px;
    object-fit: contain;
    background: var(--bg-secondary);
    flex-shrink: 0;
  }

  &__logo-placeholder {
    width: 34px;
    height: 34px;
    border-radius: 6px;
    background: var(--accent);
    color: #fff;
    font-weight: 700;
    font-size: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__meta {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__company {
    font-weight: 600;
    font-size: 13px;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__location {
    font-size: 12px;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    gap: 3px;
  }

  &__right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    flex-shrink: 0;
  }

  &__age {
    font-size: 11px;
    color: var(--text-tertiary);
    display: flex;
    align-items: center;
    gap: 3px;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 4px;
    line-height: 1.3;
  }

  &__type {
    font-size: 12px;
    color: var(--text-tertiary);
    margin: 0 0 8px;
  }

  &__status {
    margin-top: 8px;
    display: flex;
    gap: 6px;
    min-height: 20px;
  }
}

.status-chip {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  gap: 3px;

  &--applied { background: color-mix(in srgb, #2e7d32 15%, transparent); color: #2e7d32; }
  &--ignored { background: var(--bg-secondary); color: var(--text-tertiary); }
}

.source-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;

  &--af { background: #e8f5e9; color: #2e7d32; }
  &--linkedin { background: #e3f2fd; color: #0077b5; }
  &--jobbsafari { background: #fff3e0; color: #e65100; }
}

@media (prefers-color-scheme: dark) {
  .source-badge--af { background: rgba(46,125,50,.2); color: #66bb6a; }
  .source-badge--linkedin { background: rgba(0,119,181,.2); color: #42a5f5; }
  .source-badge--jobbsafari { background: rgba(230,81,0,.2); color: #ffa040; }
}

</style>
