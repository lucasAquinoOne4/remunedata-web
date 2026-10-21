import httpClient from '@/core/http/client'
import { ENV } from '@/core/config/env'
import type { Fonte, LoadsResponse, TriggerLoadResponse } from '@/core/types/api'

export interface AdminStats {
  total_revenue: number
  monthly_revenue: number
  active_subscriptions: number
  total_users: number
}

export interface AdminUser {
  id: string
  email: string
  plan_name: string | null
  status: 'active' | 'pending' | 'expired' | 'canceled'
  expires_at: string | null
  created_at: string
}

export interface SupportConversation {
  user_id: string
  email: string
  last_message: string
  unread_count: number
  updated_at: string
}

export interface SupportMessage {
  id: number
  content: string
  is_from_admin: boolean
  is_read: boolean
  created_at: string
}

const prefix = ENV.ADMIN_PATH

export const AdminService = {
  async getStats(): Promise<AdminStats> {
    const { data } = await httpClient.get(`${prefix}/stats`)
    return data
  },

  async getUsers(page = 1, limit = 10): Promise<{ items: AdminUser[], total: number }> {
    const { data } = await httpClient.get(`${prefix}/users`, {
      params: { page, limit }
    })
    return data
  },

  async resetPassword(userId: string): Promise<void> {
    await httpClient.post(`${prefix}/users/${userId}/reset-password`)
  },

  async getConversations(): Promise<SupportConversation[]> {
    const { data } = await httpClient.get(`${prefix}/support`)
    return data
  },

  async getHistory(userId: string): Promise<SupportMessage[]> {
    const { data } = await httpClient.get(`${prefix}/support/${userId}`)
    return data
  },

  async reply(userId: string, content: string): Promise<SupportMessage> {
    const { data } = await httpClient.post(`${prefix}/support/${userId}/reply`, {
      content
    })
    return data
  },

  async getLoads(): Promise<LoadsResponse> {
    const { data } = await httpClient.get<Partial<LoadsResponse>>(`${prefix}/loads`)
    return {
      fontes: Array.isArray(data?.fontes) ? data.fontes : [],
      coleta_df: Array.isArray(data?.coleta_df) ? data.coleta_df : [],
    }
  },

  async triggerLoad(fonte: Fonte, ano: number, mes: string): Promise<TriggerLoadResponse> {
    const { data } = await httpClient.post<TriggerLoadResponse>(`${prefix}/loads/${fonte}`, null, {
      params: { ano, mes },
    })
    return data
  }
}
