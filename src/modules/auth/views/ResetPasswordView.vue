<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/core/auth/supabase'
import { KeyRound, Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-vue-next'

const router = useRouter()

const password = ref('')
const confirm = ref('')
const loading = ref(false)
const ready = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

let unsubscribe: (() => void) | null = null

onMounted(async () => {
  // O supabase-js troca o token do link por uma sessão de recuperação automaticamente.
  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') ready.value = true
  })
  unsubscribe = () => data.subscription.unsubscribe()

  const { data: sessionData } = await supabase.auth.getSession()
  if (sessionData.session) {
    ready.value = true
  } else {
    // Dá um tempo para o evento de recuperação chegar antes de declarar o link inválido.
    window.setTimeout(() => {
      if (!ready.value) {
        error.value = 'Link inválido ou expirado. Solicite uma nova recuperação de senha.'
      }
    }, 2500)
  }
})

onUnmounted(() => unsubscribe?.())

async function handleReset() {
  error.value = null

  if (password.value.length < 8) {
    error.value = 'A senha deve ter pelo menos 8 caracteres.'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'As senhas não conferem.'
    return
  }

  loading.value = true
  try {
    const { error: updateError } = await supabase.auth.updateUser({ password: password.value })
    if (updateError) throw updateError

    success.value = true
    await supabase.auth.signOut()
    window.setTimeout(() => router.push({ name: 'login' }), 2000)
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Erro ao redefinir a senha.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="font-serif text-2xl font-bold text-slate-900 mb-2">Nova senha</h2>
    <p class="text-slate-500 text-sm mb-8">Defina a nova senha da sua conta</p>

    <div v-if="success" class="space-y-6 text-center py-4">
      <div class="flex justify-center">
        <div class="bg-slate-50 p-4 rounded-2xl ring-1 ring-slate-100 shadow-xl shadow-slate-900/5">
          <CheckCircle2 class="w-12 h-12 text-slate-900" />
        </div>
      </div>
      <h3 class="font-serif text-xl font-bold text-slate-900">Senha atualizada!</h3>
      <p class="text-slate-500 text-sm">Redirecionando para o login...</p>
    </div>

    <form v-else class="space-y-5" @submit.prevent="handleReset">
      <div v-if="error" class="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-start gap-3 text-sm">
        <AlertCircle class="w-5 h-5 shrink-0" />
        <span class="font-medium">{{ error }}</span>
      </div>

      <div class="space-y-1.5">
        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nova senha</label>
        <div class="relative group">
          <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <input
            v-model="password"
            type="password"
            required
            minlength="8"
            autocomplete="new-password"
            placeholder="Mínimo de 8 caracteres"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-hidden font-medium"
          />
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirmar senha</label>
        <div class="relative group">
          <Lock class="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <input
            v-model="confirm"
            type="password"
            required
            autocomplete="new-password"
            placeholder="Repita a senha"
            class="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-hidden font-medium"
          />
        </div>
      </div>

      <div class="pt-2 space-y-3">
        <button
          type="submit"
          :disabled="loading || !ready"
          class="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98]"
        >
          <Loader2 v-if="loading" class="w-5 h-5 animate-spin" />
          <KeyRound v-else class="w-5 h-5" />
          <span>{{ loading ? 'Salvando...' : 'Salvar nova senha' }}</span>
        </button>
        <router-link :to="{ name: 'recovery' }" class="block text-center text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600">
          Solicitar novo link
        </router-link>
      </div>
    </form>
  </div>
</template>
