<template>
  <div class="city-select" ref="root">
    <input
      ref="inputEl"
      type="text"
      class="input"
      :placeholder="placeholder"
      :value="displayValue"
      @input="onInput"
      @focus="onFocus"
      @keydown.down.prevent="moveDown"
      @keydown.up.prevent="moveUp"
      @keydown.enter.prevent="confirmHighlighted"
      @keydown.escape="close"
    />
    <ul v-if="open && suggestions.length" class="city-select__dropdown">
      <li
        v-for="(m, i) in suggestions"
        :key="m.afCode + m.name"
        class="city-select__item"
        :class="{ highlighted: i === highlighted }"
        @mousedown.prevent="select(m)"
      >
        <span class="city-select__name">{{ m.name }}</span>
        <span class="city-select__code">{{ m.afCode || "—" }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useTaxonomyStore } from "../stores/taxonomy";
import type { Municipality } from "../data/municipalities";

const taxonomy = useTaxonomyStore();

const props = withDefaults(defineProps<{
  modelValue: Municipality | null;
  placeholder?: string;
}>(), { placeholder: "Sök ort..." });

const emit = defineEmits<{
  "update:modelValue": [val: Municipality | null];
}>();

const root = ref<HTMLElement | null>(null);
const query = ref("");
const open = ref(false);
const highlighted = ref(0);

const displayValue = computed(() => {
  if (open.value) return query.value;
  return props.modelValue?.name ?? "";
});

const suggestions = computed(() => taxonomy.search(query.value));

function onInput(e: Event) {
  query.value = (e.target as HTMLInputElement).value;
  open.value = true;
  highlighted.value = 0;
}

function onFocus() {
  query.value = props.modelValue?.name ?? "";
  open.value = true;
}

function select(m: Municipality) {
  emit("update:modelValue", m);
  query.value = "";
  open.value = false;
}

function close() {
  open.value = false;
  query.value = "";
}

function moveDown() {
  if (highlighted.value < suggestions.value.length - 1) highlighted.value++;
}

function moveUp() {
  if (highlighted.value > 0) highlighted.value--;
}

function confirmHighlighted() {
  if (suggestions.value[highlighted.value]) {
    select(suggestions.value[highlighted.value]);
  }
}

function onClickOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) {
    close();
  }
}

onMounted(() => document.addEventListener("mousedown", onClickOutside));
onUnmounted(() => document.removeEventListener("mousedown", onClickOutside));
</script>

<style lang="scss" scoped>
.city-select {
  position: relative;
  width: 100%;

  &__dropdown {
    position: absolute;
    top: calc(100% + 3px);
    left: 0;
    right: 0;
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 7px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
    list-style: none;
    margin: 0;
    padding: 4px;
    z-index: 100;
    overflow: hidden;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 9px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 13px;

    &:hover,
    &.highlighted {
      background: var(--bg-secondary);
    }
  }

  &__name {
    color: var(--text-primary);
  }

  &__code {
    font-size: 11px;
    color: var(--text-tertiary);
    font-family: monospace;
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

  &:focus {
    border-color: var(--accent);
  }
}
</style>
