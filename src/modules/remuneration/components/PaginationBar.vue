<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { formatTotal } from '../utils/search'

defineProps<{
  page: number
  pages: number
  total: number
  capped?: boolean
  shown: number
}>()
defineEmits<{ (e: 'change', page: number): void }>()
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
    <p class="text-sm text-slate-500">
      Mostrando <span class="font-bold text-slate-900">{{ shown }}</span> de
      <span class="font-bold text-slate-900">{{ formatTotal(total, !!capped) }}</span> registros
    </p>
    <div v-if="pages > 1" class="flex items-center gap-2">
      <button
        type="button"
        class="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
        :disabled="page <= 1"
        @click="$emit('change', page - 1)"
      >
        <ChevronLeft class="w-4 h-4" /> Anterior
      </button>
      <span class="px-2 text-sm font-bold text-slate-700 select-none">
        Página {{ page }} de {{ pages.toLocaleString('pt-BR') }}
      </span>
      <button
        type="button"
        class="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
        :disabled="page >= pages"
        @click="$emit('change', page + 1)"
      >
        Próximo <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
