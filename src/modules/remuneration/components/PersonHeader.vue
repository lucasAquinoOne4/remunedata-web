<script setup lang="ts">
import { computed } from 'vue'
import { ShieldAlert, User } from 'lucide-vue-next'
import type { Fonte, PersonIdentity } from '@/core/types/api'
import { identityChips } from '../utils/profile'
import FonteBadge from './FonteBadge.vue'

const props = defineProps<{
  fonte: Fonte
  nome: string
  identidade: Partial<PersonIdentity>
}>()

const chips = computed(() => identityChips(props.identidade))
const mainChips = computed(() =>
  chips.value.filter((c) => ['vinculo', 'situacao', 'uf'].includes(c.key)),
)
// cargo e órgão viram o subtítulo; o restante fica nos detalhes
const subtitle = computed(() =>
  chips.value
    .filter((c) => ['cargo', 'orgao'].includes(c.key))
    .map((c) => c.value)
    .join(' · '),
)
const detailChips = computed(() =>
  chips.value.filter((c) => !['vinculo', 'situacao', 'uf', 'cargo', 'orgao'].includes(c.key)),
)
const cpf = computed(() => props.identidade.cpf_mascarado)
const matricula = computed(() => props.identidade.matricula)
</script>

<template>
  <header class="card space-y-5 sm:p-8">
    <div class="flex items-start gap-4">
      <div class="hidden sm:flex w-12 h-12 rounded-xl bg-slate-900 text-white items-center justify-center shrink-0">
        <User class="w-6 h-6" />
      </div>
      <div class="min-w-0 space-y-2">
        <div class="flex flex-wrap items-center gap-1.5">
          <FonteBadge :fonte="fonte" />
          <span
            v-for="c in mainChips"
            :key="c.key"
            class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold"
            :title="c.label"
          >
            {{ c.value }}
          </span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-semibold font-serif text-slate-900 tracking-tight leading-tight break-words">{{ nome }}</h1>
        <p v-if="subtitle" class="text-sm sm:text-base text-slate-600 leading-snug">{{ subtitle }}</p>
      </div>
    </div>

    <dl v-if="detailChips.length" class="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3.5 pt-5 border-t border-slate-100">
      <div v-for="c in detailChips" :key="c.key" class="min-w-0">
        <dt class="eyebrow">{{ c.label }}</dt>
        <dd class="text-sm font-medium text-slate-900 break-words mt-0.5">{{ c.value }}</dd>
      </div>
    </dl>

    <div v-if="cpf || matricula" class="pt-4 border-t border-slate-100 space-y-2">
      <div class="flex flex-wrap gap-2">
        <span v-if="cpf" class="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
          CPF {{ cpf }}
        </span>
        <span v-if="matricula" class="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700">
          Matrícula {{ matricula }}
        </span>
      </div>
      <p class="flex items-start gap-1.5 text-xs text-slate-500">
        <ShieldAlert class="w-3.5 h-3.5 mt-0.5 shrink-0" />
        CPF e matrícula são divulgados de forma parcialmente mascarada pela própria fonte oficial.
      </p>
    </div>
  </header>
</template>
