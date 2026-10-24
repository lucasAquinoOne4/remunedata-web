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
  <div class="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Fonte dos dados">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      :aria-selected="modelValue === tab.value"
      class="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
      :class="
        modelValue === tab.value
          ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10'
          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
      "
      @click="$emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
      <span
        v-if="tab.value !== 'ALL'"
        class="min-w-6 text-center text-[11px] font-black rounded-full px-1.5 py-0.5"
        :class="modelValue === tab.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'"
      >
        <template v-if="counts[tab.value as Fonte]">
          {{ formatTotal(counts[tab.value as Fonte]!.total, counts[tab.value as Fonte]!.capped) }}
        </template>
        <template v-else>{{ loading ? '…' : '–' }}</template>
      </span>
    </button>
  </div>
</template>
