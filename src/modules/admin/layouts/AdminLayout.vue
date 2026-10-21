<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  LogOut, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Database
} from 'lucide-vue-next'
import { ENV } from '@/core/config/env'
import { useAuthStore } from '@/core/auth/authStore'
import BaseButton from '@/shared/ui/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isCollapsed = ref(false)
const accessDenied = ref(false)

const menuItems = [
  { 
    name: 'Métricas', 
    path: `/${ENV.ADMIN_PATH}/dashboard`, 
    icon: BarChart3 
  },
  { 
    name: 'Usuários', 
    path: `/${ENV.ADMIN_PATH}/users`, 
    icon: Users 
  },
  { 
    name: 'Carga de dados', 
    path: `/${ENV.ADMIN_PATH}/loads`, 
    icon: Database 
  },
  { 
    name: 'Suporte', 
    path: `/${ENV.ADMIN_PATH}/support`, 
    icon: MessageSquare 
  },
]

const handleLogout = async () => {
  await authStore.signOut()
  router.push({ name: 'home' })
}

// Escuta erros 403 para exibir tela de acesso negado
import httpClient from '@/core/http/client'
httpClient.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 403 && route.path.startsWith(`/${ENV.ADMIN_PATH}`)) {
      accessDenied.value = true
    }
    return Promise.reject(err)
  }
)
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-200 flex overflow-hidden font-sans">
    <!-- Sidebar -->
    <aside 
      class="bg-slate-900/50 backdrop-blur-xl border-r border-white/5 transition-all duration-300 relative z-50"
      :class="[isCollapsed ? 'w-20' : 'w-64']"
    >
      <!-- Header -->
      <div class="h-20 flex items-center px-6 border-b border-white/5 gap-3 overflow-hidden">
        <div class="min-w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <ShieldCheck class="w-5 h-5 text-white" />
        </div>
        <span v-if="!isCollapsed" class="font-black text-lg tracking-tighter text-white uppercase italic">
          Admin<span class="text-blue-500">Data</span>
        </span>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-2">
        <router-link 
          v-for="item in menuItems" 
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all group"
          :class="[
            route.path === item.path 
              ? 'bg-white/10 text-white shadow-lg' 
              : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span v-if="!isCollapsed" class="font-bold text-sm tracking-tight">{{ item.name }}</span>
          
          <!-- Tooltip em colapsado -->
          <div v-if="isCollapsed" class="absolute left-20 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-bold uppercase tracking-widest border border-white/10">
            {{ item.name }}
          </div>
        </router-link>
      </nav>

      <!-- Footer -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-slate-900/40">
        <button 
          class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-bold text-sm"
          @click="handleLogout"
        >
          <LogOut class="w-5 h-5" />
          <span v-if="!isCollapsed">Sair</span>
        </button>
      </div>

      <!-- Collapse Toggle -->
      <button 
        class="absolute -right-3 top-24 bg-slate-800 border border-white/10 rounded-full p-1 text-slate-400 hover:text-white transition-colors"
        @click="isCollapsed = !isCollapsed"
      >
        <ChevronLeft v-if="!isCollapsed" class="w-4 h-4" />
        <ChevronRight v-else class="w-4 h-4" />
      </button>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto relative bg-[#020617]">
      <!-- Aurora Effect -->
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -z-10 animate-pulse"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full -z-10"></div>

      <!-- Access Denied State -->
      <div v-if="accessDenied" class="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
        <div class="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6 border border-red-500/20">
          <AlertCircle class="w-10 h-10 text-red-500" />
        </div>
        <h1 class="text-3xl font-black text-white mb-2">Acesso Negado</h1>
        <p class="text-slate-400 max-w-md font-medium mb-8">
          Você não possui as permissões administrativas necessárias para acessar esta área. Se acredita que isso é um erro, entre em contato com o suporte principal.
        </p>
        <BaseButton variant="outline" @click="router.push('/dashboard')">
          Voltar para o App
        </BaseButton>
      </div>

      <!-- Content View -->
      <div v-else class="p-8 max-w-7xl mx-auto min-h-screen">
        <router-view v-slot="{ Component }">
          <transition 
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform translate-y-4 opacity-0"
            enter-to-class="transform translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="transform translate-y-0 opacity-100"
            leave-to-class="transform translate-y-4 opacity-0"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
.router-link-active {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
</style>
