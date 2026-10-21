<script setup lang="ts">
import { computed } from 'vue'
import { highlightParts } from '../utils/highlight'

const props = defineProps<{ text: string | null | undefined; term?: string }>()
const parts = computed(() => highlightParts(props.text ?? '', props.term ?? ''))
</script>

<template>
  <span>
    <template v-for="(p, i) in parts" :key="i">
      <mark v-if="p.match" class="bg-amber-100 text-slate-900 rounded px-0.5">{{ p.text }}</mark>
      <template v-else>{{ p.text }}</template>
    </template>
  </span>
</template>
