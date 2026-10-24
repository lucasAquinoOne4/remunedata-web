<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'
import type { ParticipacaoSocietaria } from '@/core/types/api'
import { formatCurrency } from '@/core/formatters/currency'

defineProps<{ participacoes: ParticipacaoSocietaria[] }>()

function formatDate(value: string | null): string {
  if (!value) return ''
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : value
}

function formatCnpjRaiz(value: string): string {
  const d = (value ?? '').replace(/\D/g, '')
  return d.length === 8 ? `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}` : value
}

function situacaoClass(situacao: string | null): string {
  if (!situacao) return 'bg-slate-100 text-slate-600'
  return situacao.toLowerCase() === 'ativa'
    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    : 'bg-amber-50 text-amber-700 border border-amber-200'
}

function cnae(p: ParticipacaoSocietaria): string {
  return [p.cnae_principal, p.cnae_descricao].filter(Boolean).join(' - ')
}
</script>

<template>
  <section
    v-if="participacoes.length"
    class="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4"
    data-test="rfb"
  >
    <div>
      <h3 class="text-xl font-bold font-serif text-slate-900">Participação societária</h3>
      <p class="text-sm text-slate-500">Empresas em que a pessoa figura como sócia, nos dados abertos de CNPJ da Receita Federal.</p>
    </div>

    <p class="flex items-start gap-2 text-xs rounded-xl bg-amber-50 border border-amber-200 text-amber-800 p-3">
      <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
      <span>
        Cruzamento provável: nome idêntico e os mesmos 6 dígitos centrais do CPF; não é confirmação de identidade.
        Ser sócio de uma empresa não indica irregularidade: a lei veda a administração privada apenas a certos cargos
        e regimes, e esta base não distingue isso. Dados abertos da Receita Federal, sem endereço ou contatos.
      </span>
    </p>

    <article
      v-for="p in participacoes"
      :key="p.cnpj_basico"
      class="rounded-2xl border border-slate-100 p-4 space-y-3"
      data-test="rfb-item"
    >
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div class="space-y-0.5">
          <p class="font-bold text-slate-900">{{ p.razao_social || 'Razão social não informada' }}</p>
          <p v-if="p.nome_fantasia" class="text-xs text-slate-500">{{ p.nome_fantasia }}</p>
          <p class="text-xs text-slate-400">CNPJ (raiz) {{ formatCnpjRaiz(p.cnpj_basico) }}</p>
        </div>
        <span
          v-if="p.situacao_cadastral"
          class="text-xs font-semibold rounded-full px-2.5 py-1"
          :class="situacaoClass(p.situacao_cadastral)"
          data-test="rfb-situacao"
        >
          {{ p.situacao_cadastral }}<template v-if="p.data_situacao"> desde {{ formatDate(p.data_situacao) }}</template>
        </span>
      </div>

      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
        <div v-if="p.qualificacao" class="flex justify-between gap-3">
          <dt class="text-slate-500">Qualificação</dt><dd class="font-semibold text-slate-900 text-right">{{ p.qualificacao }}</dd>
        </div>
        <div v-if="p.data_entrada" class="flex justify-between gap-3">
          <dt class="text-slate-500">Entrada na sociedade</dt><dd class="font-semibold text-slate-900">{{ formatDate(p.data_entrada) }}</dd>
        </div>
        <div v-if="p.data_inicio_atividade" class="flex justify-between gap-3">
          <dt class="text-slate-500">Início da atividade</dt><dd class="font-semibold text-slate-900">{{ formatDate(p.data_inicio_atividade) }}</dd>
        </div>
        <div v-if="cnae(p)" class="flex justify-between gap-3">
          <dt class="text-slate-500">CNAE</dt><dd class="font-semibold text-slate-900 text-right">{{ cnae(p) }}</dd>
        </div>
        <div v-if="p.uf" class="flex justify-between gap-3">
          <dt class="text-slate-500">UF</dt><dd class="font-semibold text-slate-900">{{ p.uf }}</dd>
        </div>
        <div v-if="p.porte" class="flex justify-between gap-3">
          <dt class="text-slate-500">Porte</dt><dd class="font-semibold text-slate-900">{{ p.porte }}</dd>
        </div>
        <div v-if="p.natureza_juridica" class="flex justify-between gap-3">
          <dt class="text-slate-500">Natureza jurídica</dt><dd class="font-semibold text-slate-900 text-right">{{ p.natureza_juridica }}</dd>
        </div>
        <div v-if="p.capital_social != null" class="flex justify-between gap-3">
          <dt class="text-slate-500">Capital social</dt>
          <dd class="font-semibold text-slate-900" data-test="rfb-capital">{{ formatCurrency(p.capital_social) }}</dd>
        </div>
      </dl>
    </article>
  </section>
</template>
