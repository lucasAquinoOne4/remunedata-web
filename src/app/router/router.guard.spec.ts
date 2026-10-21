import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reactive } from 'vue'

const auth = reactive({ isAuthenticated: true })
const sub = reactive({ status: { status: 'active' } as unknown, isPremium: true, isAdmin: false, fetchStatus: vi.fn() })

vi.mock('@/core/auth/authStore', () => ({ useAuthStore: () => auth }))
vi.mock('@/modules/subscriptions/store/subscriptionStore', () => ({ useSubscriptionStore: () => sub }))
vi.mock('@/core/config/env', () => ({ ENV: { ADMIN_PATH: 'adm', ADMIN_EMAILS: [], API_URL: '/api', IS_DEV: false } }))

// Evita carregar as telas reais (e ECharts) durante o teste de navegação
vi.mock('@/modules/dashboard/views/DashboardView.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/modules/admin/layouts/AdminLayout.vue', () => ({ default: { template: '<div><router-view /></div>' } }))
vi.mock('@/modules/admin/views/AdminLoadsView.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/app/layouts/MainLayout.vue', () => ({ default: { template: '<div><router-view /></div>' } }))

import router from './index'

describe('guard de rotas admin', () => {
  beforeEach(async () => {
    auth.isAuthenticated = true
    sub.isAdmin = false
    await router.push('/dashboard')
  })

  it('redireciona não-admin de /loads para o dashboard', async () => {
    await router.push('/adm/loads')
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('redireciona não-admin de /executions (rota antiga) para o dashboard', async () => {
    await router.push('/executions')
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('permite admin em /loads e a rota antiga /executions leva para lá', async () => {
    sub.isAdmin = true
    await router.push('/executions')
    expect(router.currentRoute.value.name).toBe('admin-loads')
  })

  it('link antigo de detalhe leva à busca com o nome', async () => {
    sub.isAdmin = true
    await router.push('/remuneration/123?nome=ANA&fonte=DF')
    expect(router.currentRoute.value.name).toBe('remuneration')
    expect(router.currentRoute.value.query).toMatchObject({ nome: 'ANA', fonte: 'DF' })
  })
})
