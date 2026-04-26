<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal" role="dialog">
        <!-- Header -->
        <div class="modal__header">
          <div class="modal__identity">
            <img v-if="job.logoUrl" :src="job.logoUrl" :alt="job.company" class="modal__logo" />
            <div v-else class="modal__logo-placeholder">{{ initial }}</div>
            <div>
              <div class="modal__company">{{ job.company }}</div>
              <div class="modal__location"><MapPin :size="11" class="inline-icon" />{{ job.location }}</div>
            </div>
          </div>
          <button class="modal__close" @click="emit('close')"><X :size="16" /></button>
        </div>

        <!-- Title + meta -->
        <div class="modal__body">
          <div class="modal__title-row">
            <h2 class="modal__title">{{ job.title }}</h2>
            <span class="source-badge" :class="`source-badge--${job.source}`">
              {{ sourceLabel }}
            </span>
          </div>

          <div class="modal__meta">
            <span v-if="job.employmentType">{{ job.employmentType }}</span>
            <span>{{ dateText }}</span>
            <span v-if="detail.deadline">Sista dag: {{ deadlineText }}</span>
          </div>

          <!-- Beskrivning -->
          <div v-if="loadingDetail" class="modal__loading">
            <div class="spinner" /> Hämtar info...
          </div>
          <div v-else-if="descriptionText" class="modal__description" v-html="descriptionText" />
          <div v-else class="modal__no-desc">Ingen beskrivning tillgänglig.</div>
        </div>

        <!-- Footer actions -->
        <div class="modal__footer">
          <div class="modal__status-btns">
            <button
              class="action-btn action-btn--applied"
              :class="{ active: status.isApplied(job.url) }"
              @click="status.toggleApplied(job)"
            >
              <CheckCircle :size="13" class="inline-icon" />{{ status.isApplied(job.url) ? "Sökt" : "Markera sökt" }}
            </button>
            <button
              class="action-btn action-btn--ignore"
              :class="{ active: status.isIgnored(job.url) }"
              @click="status.toggleIgnored(job)"
            >
              <EyeOff :size="13" class="inline-icon" />{{ status.isIgnored(job.url) ? "Visa igen" : "Ignorera" }}
            </button>
          </div>
          <button class="btn-apply" @click="openUrl(job.url)">
            Gå till ansökan <ExternalLink :size="13" class="inline-icon" />
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { UnifiedJob } from "../stores/jobs";
import { useJobStatusStore } from "../stores/jobStatus";
import { fetchJobDetail, type JobDetail } from "../services/jobDetail";
import { openUrl } from "@tauri-apps/plugin-opener";
import { X, MapPin, CheckCircle, EyeOff, ExternalLink } from "lucide-vue-next";

const props = defineProps<{ job: UnifiedJob }>();
const emit = defineEmits<{ close: [] }>();

const status = useJobStatusStore();
const detail = ref<JobDetail>({});
const loadingDetail = ref(false);

const initial = computed(() => props.job.company?.[0]?.toUpperCase() ?? "?");

const sourceLabel = computed(() => ({
  af: "AF", linkedin: "LinkedIn", jobbsafari: "JobbSafari",
})[props.job.source] ?? props.job.source);

const dateText = computed(() => {
  const d = new Date(props.job.publishedAt);
  if (isNaN(d.getTime())) return "";
  return `Publicerad ${d.toLocaleDateString("sv-SE")}`;
});

const deadlineText = computed(() => {
  if (!detail.value.deadline) return "";
  return new Date(detail.value.deadline).toLocaleDateString("sv-SE");
});

const descriptionText = computed(() => {
  // AF har beskrivning direkt i job-objektet
  return props.job.description || detail.value.description || "";
});

// Hämta detaljer när modal öppnas (för LinkedIn/JobbSafari)
watch(() => props.job, async (job) => {
  detail.value = {};
  if (job.description) return; // AF — redan klart
  if (!job.url) return;
  loadingDetail.value = true;
  detail.value = await fetchJobDetail(job.url, job.source);
  loadingDetail.value = false;
}, { immediate: true });
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(2px);
}

.modal {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  width: 100%;
  max-width: 620px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px 14px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  &__identity {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__logo {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    object-fit: contain;
    background: var(--bg-secondary);
    flex-shrink: 0;
  }

  &__logo-placeholder {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    background: var(--accent);
    color: #fff;
    font-weight: 700;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__company {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary);
  }

  &__location {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 3px;
  }

  &__close {
    background: none;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    &:hover { background: var(--bg-secondary); color: var(--text-primary); }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 18px 20px;
  }

  &__title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }

  &__title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.3;
  }

  &__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
    font-size: 12px;
    color: var(--text-secondary);

    span + span::before {
      content: "·";
      margin-right: 8px;
    }
  }

  &__description {
    font-size: 13px;
    line-height: 1.7;
    color: var(--text-primary);

    :deep(p) { margin: 0 0 10px; }
    :deep(br) { display: block; content: ""; margin-bottom: 4px; }
    :deep(h1), :deep(h2), :deep(h3), :deep(h4) {
      font-size: 14px;
      font-weight: 700;
      margin: 14px 0 6px;
      color: var(--text-primary);
    }
    :deep(ul), :deep(ol) {
      margin: 6px 0 10px 18px;
      padding: 0;
    }
    :deep(li) { margin-bottom: 4px; }
    :deep(strong), :deep(b) { font-weight: 600; }
    :deep(a) { color: var(--accent); text-decoration: none; }
  }

  &__no-desc {
    font-size: 13px;
    color: var(--text-tertiary);
    font-style: italic;
  }

  &__loading {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-secondary);
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
  }

  &__status-btns {
    display: flex;
    gap: 8px;
  }
}

.source-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;

  &--af { background: #e8f5e9; color: #2e7d32; }
  &--linkedin { background: #e3f2fd; color: #0077b5; }
  &--jobbsafari { background: #fff3e0; color: #e65100; }
}

@media (prefers-color-scheme: dark) {
  .source-badge--af { background: rgba(46,125,50,.2); color: #66bb6a; }
  .source-badge--linkedin { background: rgba(0,119,181,.2); color: #42a5f5; }
  .source-badge--jobbsafari { background: rgba(230,81,0,.2); color: #ffa040; }
}

.action-btn {
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 7px;
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.1s;
  display: inline-flex;
  align-items: center;
  gap: 5px;

  &--applied {
    &:hover, &.active { background: #2e7d32; border-color: #2e7d32; color: #fff; }
  }

  &--ignore {
    &:hover, &.active { border-color: var(--text-tertiary); color: var(--text-tertiary); }
  }
}

.btn-apply {
  padding: 8px 18px;
  border-radius: 8px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  &:hover { opacity: 0.85; }
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
