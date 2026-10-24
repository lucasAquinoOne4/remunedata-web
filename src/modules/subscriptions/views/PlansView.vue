<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Rocket, ShieldCheck, ArrowRight, Search } from 'lucide-vue-next'
import BaseButton from '@/shared/ui/BaseButton.vue'

const router = useRouter()
const route = useRoute()
import PlansGrid from '../components/PlansGrid.vue'
import CheckoutForm from '../components/CheckoutForm.vue'
import { SubscriptionService, type Plan } from '../services/subscription.service'
import { useAuthStore } from '@/core/auth/authStore'
import { useSubscriptionStore } from '../store/subscriptionStore'

const authStore = useAuthStore()
const subStore = useSubscriptionStore()

const selectedPlan = ref<Plan | null>(null)
const isCheckingOut = ref(false)
const error = ref('')

// Controle de Sucesso Pós-Pagamento
const isSuccess = computed(() => route.query.success === 'true')
const isForbidden = computed(() => route.query.redirect === 'forbidden')
const blockedFeature = computed(() => route.query.feature as string || 'Funcionalidade')

// Auto-seleção de plano via URL (Útil após login)
import { onMounted, watch } from 'vue'

const handlePlanSelect = (plan: Plan) => {
  // Agora permitimos a seleção e preenchimento mesmo para visitantes
  selectedPlan.value = plan
}

// Lógica para auto-selecionar plano se vier da URL
const checkUrlParams = async () => {
  const planSlug = route.query.plan as string
  if (planSlug && authStore.isAuthenticated && !selectedPlan.value) {
    try {
      const allPlans = await SubscriptionService.getPlans()
      const plan = allPlans.find(p => p.slug === planSlug)
      if (plan) selectedPlan.value = plan
    } catch {
      // Silently ignore error for auto-selection logic to avoid console warnings
    }
  }
}

onMounted(async () => {
  await checkUrlParams()
  
  // Recupera dados salvos de checkout se houver (fluxo pós-login)
  const savedData = window.localStorage.getItem('pending_checkout_data')
  if (savedData && authStore.isAuthenticated) {
    try {
      const parsed = JSON.parse(savedData)
      if (selectedPlan.value) {
        handleCheckoutSubmit(parsed)
      }
      window.localStorage.removeItem('pending_checkout_data')
    } catch {
      window.localStorage.removeItem('pending_checkout_data')
    }
  }

  // Novo: Se for sucesso, força re-fetch do status para liberar o app
  if (isSuccess.value) {
    await subStore.fetchStatus()
  }
})

watch(() => route.query.plan, checkUrlParams)

const handleCheckoutSubmit = async (formData: { name: string, tax_id: string, cellphone: string }) => {
  if (!selectedPlan.value) return

  // Se o usuário não estiver logado, salvamos os dados e pedimos login/cadastro
  if (!authStore.isAuthenticated) {
    window.localStorage.setItem('pending_checkout_data', JSON.stringify(formData))
    
    // Evita duplicidade de parâmetros ao redirecionar
    router.push({
      name: 'signup',
      query: { 
        redirect: '/subscriptions/plans',
        plan: selectedPlan.value.slug 
      }
    })
    return
  }

  isCheckingOut.value = true
  error.value = ''

  try {
    const { checkout_url } = await SubscriptionService.createCheckout({
      plan_slug: selectedPlan.value.slug,
      name: formData.name,
      email: authStore.user?.email || '',
      cellphone: formData.cellphone.replace(/\D/g, ''),
      tax_id: formData.tax_id.replace(/\D/g, ''),
    })

    // Redireciona para o AbacatePay
    window.location.href = checkout_url
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { detail?: string } } }
    error.value = axiosError.response?.data?.detail || 'Erro ao iniciar checkout. Tente novamente.'
    isCheckingOut.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 pt-12 pb-24 px-4 overflow-hidden relative">
    <!-- Background Blob for Glassmorphism Contrast -->
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent rounded-full blur-3xl -z-10"></div>
    <!-- Cabeçalho -->
    <div class="max-w-4xl mx-auto text-center mb-16 px-4">
      <div v-if="isForbidden" class="mb-8 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-medium animate-in slide-in-from-top-2 duration-300 flex items-center gap-3 justify-center">
        <ShieldCheck class="w-5 h-5 text-slate-600" />
        <span class="font-bold">Acesso Restrito:</span> Você precisa de uma assinatura ativa para acessar a funcionalidade <span class="text-slate-900 font-black underline decoration-slate-300 decoration-2 underline-offset-4">{{ blockedFeature }}</span>.
      </div>
      
      <h1 class="text-4xl md:text-7xl font-black text-slate-900 font-serif tracking-tighter mb-6 leading-tight">
        Escolha o plano ideal para <span class="italic text-slate-400 font-medium">sua jornada.</span>
      </h1>
      <p class="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
        Acesso ilimitado à consulta de remuneração do setor público: estados, Executivo Federal, Senado e Justiça do DF.
        Simples, seguro e transparente.
      </p>
    </div>

    <!-- Modais / Views Condicionais -->
    <div class="flex justify-center items-start min-h-[500px]">
      <!-- Estado: Sucesso Pós-Pagamento -->
      <div v-if="isSuccess" class="max-w-2xl w-full bg-slate-900 rounded-[3rem] p-12 text-white text-center shadow-2xl animate-in zoom-in-95 duration-700 relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full -mr-32 -mt-32 blur-[100px] opacity-50"></div>
        <div class="relative z-10 flex flex-col items-center">
          <div class="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/20">
            <ShieldCheck class="w-12 h-12" />
          </div>
          <h2 class="text-4xl font-bold font-serif mb-4">Assinatura Confirmada!</h2>
          <p class="text-slate-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Parabéns! Sua conta agora é <span class="text-white font-bold italic">Premium</span>. 
            Todas as funcionalidades e filtros avançados já foram liberados imediatamente para você.
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md mb-10">
            <div class="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 text-left">
              <Search class="w-6 h-6 text-white mb-3" />
              <p class="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Próximo Passo</p>
              <p class="text-sm font-bold">Faça sua primeira consulta avançada agora.</p>
            </div>
            <div class="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 text-left">
              <Rocket class="w-6 h-6 text-white mb-3" />
              <p class="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Dica Pro</p>
              <p class="text-sm font-bold">Use os filtros de cargo e órgão para refinar.</p>
            </div>
          </div>

          <RouterLink to="/remuneration">
            <BaseButton class="bg-white text-slate-900 border-none px-12 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-all shadow-2xl flex items-center gap-2">
              Começar Consultas
              <ArrowRight class="w-6 h-6" />
            </BaseButton>
          </RouterLink>
        </div>
      </div>

      <!-- Estado: Já Assinante (Sem ser via sucesso) -->
      <div v-else-if="subStore.isActive && !isSuccess" class="max-w-md w-full bg-white rounded-3xl p-10 border border-slate-200 text-center shadow-xl animate-in zoom-in-95 duration-500">
        <div class="w-20 h-20 bg-slate-900 text-white rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck class="w-10 h-10" />
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-2">Assinatura Ativa!</h2>
        <p class="text-slate-500 mb-8">
          Você já possui o plano <span class="font-bold text-slate-900">{{ subStore.currentPlan }}</span> ativo. 
          Aproveite o acesso ilimitado aos dados.
        </p>
        <RouterLink to="/dashboard">
          <BaseButton class="w-full py-4 rounded-xl">Ir para o Dashboard</BaseButton>
        </RouterLink>
      </div>

      <div v-else-if="!selectedPlan" class="w-full animate-in slide-in-from-bottom-4 duration-500">
        <PlansGrid @select="handlePlanSelect" />
      </div>

      <div v-else class="w-full flex justify-center animate-in zoom-in-95 duration-300">
        <CheckoutForm 
          :plan-name="selectedPlan.name"
          :loading="isCheckingOut"
          @submit="handleCheckoutSubmit"
          @cancel="selectedPlan = null"
        />
      </div>
    </div>

    <!-- Rodapé Informativo -->
    <div class="max-w-6xl mx-auto mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-slate-100 pt-12">
      <div class="flex flex-col items-center text-center px-4">
        <div class="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-900 mb-4">
          <ShieldCheck class="w-6 h-6" />
        </div>
        <h4 class="font-bold text-slate-900 mb-2">Checkout Seguro</h4>
        <p class="text-sm text-slate-500 font-medium">Pagamentos criptografados processados via AbacatePay com total segurança.</p>
      </div>
      <div class="flex flex-col items-center text-center px-4">
        <div class="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-900 mb-4">
          <Rocket class="w-6 h-6" />
        </div>
        <h4 class="font-bold text-slate-900 mb-2">Acesso Instantâneo</h4>
        <p class="text-sm text-slate-500 font-medium">Após a confirmação do pagamento (PIX ou Cartão), seu acesso é liberado na hora.</p>
      </div>
      <div class="flex flex-col items-center text-center px-4">
        <div class="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-900 mb-4">
          <ArrowRight class="w-6 h-6" />
        </div>
        <h4 class="font-bold text-slate-900 mb-2">Cancelamento Fácil</h4>
        <p class="text-sm text-slate-500 font-medium">Sem pegadinhas ou multas. Cancele sua renovação quando quiser diretamente no painel.</p>
      </div>
    </div>
  </div>
</template>
