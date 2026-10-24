<script setup lang="ts">
import { computed } from 'vue'
import { buildFichaSections } from '../utils/ficha'

const props = defineProps<{ ficha: Record<string, unknown> | null }>()
const sections = computed(() => buildFichaSections(props.ficha))
</script>

<template>
  <section v-if="sections.length" class="card-sub space-y-4">
    <div>
      <h3 class="section-title">Ficha federal</h3>
      <p class="section-sub">Dados complementares do Portal da Transparência do Governo Federal.</p>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div v-for="(s, i) in sections" :key="i" class="rounded-xl border border-slate-200 bg-white p-4">
        <h4 class="eyebrow mb-2">{{ s.title }}</h4>
        <dl class="space-y-1.5">
          <div v-for="r in s.rows" :key="r.label" class="flex justify-between gap-4 text-sm">
            <dt class="text-slate-600">{{ r.label }}</dt>
            <dd class="font-medium text-slate-900 text-right break-words">{{ r.value }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>
