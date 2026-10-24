<script setup lang="ts">
import { ArrowRight, CheckCircle2, Zap, Shield, ChevronRight, X, Landmark, LineChart, Link2 } from 'lucide-vue-next'
import BaseButton from '@/shared/ui/BaseButton.vue'
</script>

<template>
  <div class="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
    <!-- Navigation -->
    <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-4 sm:px-6 py-3.5">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
            <span class="font-bold text-lg leading-none">R</span>
          </div>
          <span class="font-serif font-bold text-xl tracking-tight">RemuneData</span>
        </div>
        <div class="flex items-center gap-4 sm:gap-6">
          <RouterLink to="/auth/login" class="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors">
            Entrar
          </RouterLink>
          <RouterLink :to="{ name: 'signup', query: { redirect: '/subscriptions/plans' } }">
            <BaseButton class="bg-slate-900 text-white hover:bg-slate-800 px-4 sm:px-6 py-2 rounded-xl text-sm font-semibold">
              Começar Agora
            </BaseButton>
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- Hero Section Content -->
    <header class="relative pt-16 sm:pt-24 pb-20 sm:pb-28 px-4 sm:px-6 overflow-hidden">
      <div class="max-w-4xl mx-auto text-center space-y-8">
        <h1 class="text-5xl sm:text-6xl md:text-7xl font-semibold font-serif tracking-tight leading-[1] text-slate-900">
          Dados públicos, <br />
          <span class="italic text-slate-500 font-medium">inteligência privada.</span>
        </h1>
        <p class="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Consulte a remuneração de servidores dos governos do DF, Ceará, Pernambuco e Santa Catarina, do Executivo Federal, do Senado e da Justiça do DF, com busca rápida, histórico mês a mês e cruzamentos com dados abertos do TSE e da Receita Federal.
        </p>
        <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center">
          <RouterLink :to="{ name: 'signup', query: { redirect: '/subscriptions/plans' } }">
            <BaseButton class="bg-slate-900 text-white w-full sm:w-auto px-10 py-4 text-lg font-semibold rounded-2xl flex items-center justify-center gap-2 group shadow-lg shadow-slate-900/15 hover:bg-slate-800 transition-colors">
              Criar Conta Grátis
              <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </BaseButton>
          </RouterLink>
          <p class="text-sm text-slate-500">Dados públicos, organizados para consulta.</p>
        </div>
      </div>
    </header>

    <!-- Cobertura -->
    <section class="py-16 sm:py-20 px-4 sm:px-6 border-t border-slate-100" aria-labelledby="cobertura-titulo">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-10 space-y-3">
          <h2 id="cobertura-titulo" class="text-3xl md:text-4xl font-semibold font-serif tracking-tight">O que você encontra</h2>
          <p class="text-slate-600 max-w-2xl mx-auto">
            Dados abertos oficiais reunidos em um só lugar. A cobertura de cada fonte depende dos períodos já carregados.
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            <div class="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center"><Landmark class="w-5 h-5" /></div>
            <h3 class="text-xl font-semibold">Remuneração de servidores</h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              Governos do DF, Ceará, Pernambuco e Santa Catarina, Executivo Federal, Senado e Justiça do DF.
            </p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            <div class="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center"><LineChart class="w-5 h-5" /></div>
            <h3 class="text-xl font-semibold">Histórico e comparação</h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              Evolução mês a mês, composição da remuneração e comparação com pares do mesmo cargo.
            </p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            <div class="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center"><Link2 class="w-5 h-5" /></div>
            <h3 class="text-xl font-semibold">Cruzamentos com dados abertos</h3>
            <p class="text-sm text-slate-600 leading-relaxed">
              Candidaturas e patrimônio declarado (TSE) e participação societária (CNPJ, Receita Federal). São cruzamentos prováveis, não confirmação de identidade.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Comparison Section -->
    <section class="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-10 sm:mb-14">
          <h2 class="text-3xl md:text-4xl font-semibold font-serif tracking-tight mb-3">Por que o RemuneData?</h2>
          <p class="text-slate-600 italic">"A transparência deve ser fácil, não um labirinto."</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          <!-- Coluna 1: Portal Oficial -->
          <div class="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 flex flex-col items-center text-center space-y-6">
            <div class="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
              <Shield class="w-8 h-8" />
            </div>
            <div>
              <h3 class="font-semibold text-slate-500 uppercase tracking-widest text-[11px] mb-2">Portal Oficial</h3>
              <p class="font-serif font-bold text-2xl text-slate-800">Transparência Estática</p>
            </div>
            <ul class="space-y-4 w-full text-left">
              <li class="flex items-start gap-3 text-slate-500 text-sm">
                <X class="w-5 h-5 text-slate-300 flex-shrink-0" />
                Interface lenta e navegação confusa.
              </li>
              <li class="flex items-start gap-3 text-slate-500 text-sm">
                <X class="w-5 h-5 text-slate-300 flex-shrink-0" />
                Buscas complexas e falta de clareza.
              </li>
              <li class="flex items-start gap-3 text-slate-500 text-sm">
                <X class="w-5 h-5 text-slate-300 flex-shrink-0" />
                Dificuldade em visualizar tendências.
              </li>
            </ul>
          </div>

          <!-- Coluna 2: RemuneData -->
          <div class="bg-slate-900 p-7 sm:p-9 rounded-3xl border border-slate-800 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-full -mr-16 -mt-16 blur-3xl opacity-20"></div>
            <div class="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-slate-900">
              <Zap class="w-8 h-8 fill-current" />
            </div>
            <div>
              <h3 class="font-semibold text-slate-400 uppercase tracking-widest text-[11px] mb-2">RemuneData Pro</h3>
              <p class="font-serif font-bold text-2xl text-white">Inteligência Ativa</p>
            </div>
            <ul class="space-y-4 w-full text-left relative z-10">
              <li class="flex items-start gap-3 text-slate-300 font-medium text-sm">
                <CheckCircle2 class="w-5 h-5 text-white flex-shrink-0" />
                Busca instantânea e filtros dinâmicos.
              </li>
              <li class="flex items-start gap-3 text-slate-300 font-medium text-sm">
                <CheckCircle2 class="w-5 h-5 text-white flex-shrink-0" />
                Dashboard analítico consolidado.
              </li>
              <li class="flex items-start gap-3 text-slate-300 font-medium text-sm">
                <CheckCircle2 class="w-5 h-5 text-white flex-shrink-0" />
                Histórico e evolução mês a mês.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Footer -->
    <footer class="py-16 sm:py-24 px-4 sm:px-6 border-t border-slate-100 text-center">
      <div class="max-w-3xl mx-auto space-y-8">
        <h2 class="text-4xl md:text-6xl font-semibold font-serif tracking-tight leading-tight">Pronto para ter clareza total?</h2>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8">
          <RouterLink :to="{ name: 'signup', query: { redirect: '/subscriptions/plans' } }">
            <BaseButton class="bg-slate-900 text-white px-10 py-4 text-lg font-semibold rounded-2xl shadow-lg shadow-slate-900/15 hover:bg-slate-800 transition-colors">
              Começar Agora
            </BaseButton>
          </RouterLink>
          <RouterLink to="/auth/login" class="flex items-center gap-2 font-semibold text-slate-700 hover:text-slate-900 group text-lg transition-colors">
            Já tenho conta
            <ChevronRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </RouterLink>
        </div>
        <div class="pt-10 text-[11px] uppercase font-semibold tracking-widest text-slate-500">
          RemuneData &copy; 2026 · Dados públicos de remuneração
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800;900&display=swap');

:deep(h1), :deep(h2), :deep(h3), :deep(h4), nav span {
  font-family: 'Instrument Serif', serif;
}

body {
  font-family: 'Inter', sans-serif;
}
</style>
