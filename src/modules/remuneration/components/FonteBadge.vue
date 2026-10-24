<script setup lang="ts">
import { computed } from 'vue'
import { FONTE_LABEL, type Fonte } from '@/core/types/api'

const props = defineProps<{ fonte: Fonte; short?: boolean }>()

const label = computed(() => (props.short ? props.fonte : FONTE_LABEL[props.fonte]))
</script>

<template>
  <span
    class="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap"
  >
    {{ label }}
  </span>
</template>
