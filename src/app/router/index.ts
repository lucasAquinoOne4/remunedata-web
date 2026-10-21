import { createRouter, createWebHistory } from 'vue-router'
import { ENV } from '@/core/config/env'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/modules/home/views/LandingView.vue'),
    },
    {
      path: '/app',
      component: () => import('@/app/layouts/MainLayout.vue'),
      redirect: '/dashboard',
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          component: () => import('@/modules/dashboard/views/DashboardView.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: '/remuneration',
          name: 'remuneration',
          component: () => import('@/modules/remuneration/views/RemunerationView.vue'),
          meta: { 
            requiresAuth: true, 
            requiresSubscription: true,
            feature: 'Consulta Pública'
          },
        },
        {
          path: '/pessoa/:fonte/:id',
          name: 'person',
          component: () => import('@/modules/remuneration/views/PersonProfileView.vue'),
          meta: {
            requiresAuth: true,
            requiresSubscription: true,
            feature: 'Perfil do Servidor'
          },
        },
        {
          // Link antigo (id numérico não mapeia para o novo perfil): leva à busca pelo nome
          path: '/remuneration/:id',
          name: 'remuneration-detail',
          redirect: (to) => {
            const nome = typeof to.query.nome === 'string' ? to.query.nome : ''
            const fonte = typeof to.query.fonte === 'string' ? to.query.fonte : ''
            return { name: 'remuneration', params: {}, query: { ...(nome && { nome }), ...(fonte && { fonte }) } }
          },
        },
        {
          // Execuções agora vivem na área admin (Carga de dados)
          path: '/executions',
          name: 'executions',
          redirect: `/${ENV.ADMIN_PATH}/loads`,
        },
        {
          path: '/subscriptions/plans',
          name: 'subscriptions-plans',
          alias: '/checkout',
          component: () => import('@/modules/subscriptions/views/PlansView.vue'),
        },
      ],
    },
    {
      path: '/auth',
      component: () => import('@/modules/auth/layouts/AuthLayout.vue'),
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/modules/auth/views/LoginView.vue'),
        },
        {
          path: 'signup',
          name: 'signup',
          component: () => import('@/modules/auth/views/SignupView.vue'),
        },
        {
          path: 'recovery',
          name: 'recovery',
          component: () => import('@/modules/auth/views/RecoveryView.vue'),
        },
        {
          path: 'reset-password',
          name: 'reset-password',
          component: () => import('@/modules/auth/views/ResetPasswordView.vue'),
        },
      ],
    },
    {
      path: `/${ENV.ADMIN_PATH}`,
      component: () => import('@/modules/admin/layouts/AdminLayout.vue'),
      redirect: `/${ENV.ADMIN_PATH}/dashboard`,
      children: [
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/modules/admin/views/AdminDashboardView.vue'),
          meta: { requiresAuth: true, isAdmin: true },
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/modules/admin/views/AdminUsersView.vue'),
          meta: { requiresAuth: true, isAdmin: true },
        },
        {
          path: 'loads',
          name: 'admin-loads',
          component: () => import('@/modules/admin/views/AdminLoadsView.vue'),
          meta: { requiresAuth: true, isAdmin: true },
        },
        {
          path: 'support',
          name: 'admin-support',
          component: () => import('@/modules/admin/views/AdminSupportView.vue'),
          meta: { requiresAuth: true, isAdmin: true },
        },
      ],
    },
    // Rota 404 - Redireciona para Home
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'home' }
    }
  ],
})

import { useAuthStore } from '@/core/auth/authStore'
import { useSubscriptionStore } from '@/modules/subscriptions/store/subscriptionStore'

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  const subStore = useSubscriptionStore()

  // 1. Prioridade: Se a rota exige autenticação e o usuário não está logado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ 
      name: 'login', 
      query: { redirect: to.fullPath } 
    })
  }

  // 2. Se o usuário já está logado e tenta acessar rotas de autenticação (login/signup) ou landing page
  // (reset-password fica de fora: o link de recuperação abre uma sessão temporária)
  if (
    authStore.isAuthenticated &&
    to.name !== 'reset-password' &&
    (to.path.startsWith('/auth') || to.path === '/')
  ) {
    return next({ name: 'dashboard' })
  }

  // 3. Verificação de Assinatura para usuários autenticados
  if (authStore.isAuthenticated) {
    // Garante que o status da assinatura esteja carregado ou forçado via query de sucesso
    if (!subStore.status || to.query.success === 'true') {
      await subStore.fetchStatus()
    }

    // Rotas administrativas: somente admin (o backend também valida)
    if (to.meta.isAdmin && !subStore.isAdmin) {
      return next({ name: 'dashboard' })
    }

    // Se a rota exige assinatura ativa e o usuário logado não tem plano (ou não é admin)
    if (to.meta.requiresSubscription && !subStore.isPremium) {
      return next({ 
        name: 'subscriptions-plans',
        query: { 
          redirect: 'forbidden',
          feature: to.meta.feature as string || 'Funcionalidade Restrita'
        }
      })
    }
  }

  next()
})

router.onError((error, to) => {
  const errors = [
    'Failed to fetch dynamically imported module',
    'Importing a module script failed',
    'error loading dynamically imported module'
  ]

  if (errors.some(msg => error.message?.includes(msg))) {
    // eslint-disable-next-line no-console
    console.warn('Chunk loading failed. Force refreshing page...')
    window.location.href = to.fullPath
  }
})

export default router
