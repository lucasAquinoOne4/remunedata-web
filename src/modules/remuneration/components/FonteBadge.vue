<script setup lang="ts">
import { computed } from 'vue'
import { FONTE_LABEL, type Fonte } from '@/core/types/api'

const props = defineProps<{ fonte: Fonte; short?: boolean }>()

const styles: Record<Fonte, string> = {
  DF: 'bg-sky-50 text-sky-700 border-sky-200',
  SENADO: 'bg-amber-50 text-amber-700 border-amber-200',
  FEDERAL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CE: 'bg-orange-50 text-orange-700 border-orange-200',
  PE: 'bg-rose-50 text-rose-700 border-rose-200',
  GO: 'bg-lime-50 text-lime-700 border-lime-200',
  SC: 'bg-violet-50 text-violet-700 border-violet-200',
  JU: 'bg-indigo-50 text-indigo-700 border-indigo-200',
}
const label = computed(() => (props.short ? props.fonte : FONTE_LABEL[props.fonte]))
</script>

<template>
  <span
    class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap"
    :class="styles[fonte]"
  >
    {{ label }}
  </span>
</template>
