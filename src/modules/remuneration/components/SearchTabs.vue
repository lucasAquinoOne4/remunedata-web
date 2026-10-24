<script setup lang="ts">
import { computed } from 'vue'
import { FONTE_LABEL, type Fonte } from '@/core/types/api'
import { formatTotal, type FonteTab } from '../utils/search'

const props = defineProps<{
  available: Fonte[]
  modelValue: FonteTab
  counts: Record<Fonte, { total: number; capped: boolean } | null>
  loading?: boolean
}>()
defineEmits<{ (e: 'update:modelValue', value: FonteTab): void }>()

const tabs = computed<{ value: FonteTab; label: string }[]>(() => [
  { value: 'ALL', label: 'Todas' },
  ...props.available.map((f) => ({ value: f as FonteTab, label: FONTE_LABEL[f] })),
])
</script>

<template>
  <div class="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 min-w-0" role="tablist" aria-label="Fonte dos dados">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      :aria-selected="modelValue === tab.value"
      class="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors"
      :class="
        modelValue === tab.value
          ? 'bg-slate-900 text-white border-slate-900'
          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
      "
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
      <span
        v-if="tab.value !== 'ALL'"
        class="min-w-6 text-center text-[11px] font-semibold rounded-full px-1.5 py-0.5"
        :class="modelValue === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'"
      >
        <template v-if="counts[tab.value as Fonte]">
          {{ formatTotal(counts[tab.value as Fonte]!.total, counts[tab.value as Fonte]!.capped) }}
        </template>
        <template v-else>{{ loading ? '…' : '–' }}</template>
      </span>
    </button>
  </div>
</template>
