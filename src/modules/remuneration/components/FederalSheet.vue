<script setup lang="ts">
import { computed } from 'vue'
import { buildFichaSections } from '../utils/ficha'

const props = defineProps<{ ficha: Record<string, unknown> | null }>()
const sections = computed(() => buildFichaSections(props.ficha))
</script>

<template>
  <section v-if="sections.length" class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
    <div>
      <h3 class="text-xl font-bold font-serif text-slate-900">Ficha federal</h3>
      <p class="text-sm text-slate-500">Dados complementares do Portal da Transparência do Governo Federal.</p>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div v-for="(s, i) in sections" :key="i" class="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
        <h4 class="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{{ s.title }}</h4>
        <dl class="space-y-1.5">
          <div v-for="r in s.rows" :key="r.label" class="flex justify-between gap-4 text-sm">
            <dt class="text-slate-500">{{ r.label }}</dt>
            <dd class="font-semibold text-slate-900 text-right break-words">{{ r.value }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>
