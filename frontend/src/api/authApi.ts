import { apiClient } from '@/api/apiClient'
import type { MessageResponse } from '@/types/auth'

export async function requestPasswordReset(email: string): Promise<MessageResponse> {
  const { data } = await apiClient.post<MessageResponse>('/auth/forgot-password', { email })
  return data
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<MessageResponse> {
  const { data } = await apiClient.post<MessageResponse>('/auth/reset-password', {
    token,
    newPassword,
  })
  return data
}
