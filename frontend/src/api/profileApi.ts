import { apiClient } from '@/api/apiClient'
import {
  mapProfileSummaryDto,
  toOnboardingApiPayload,
  toProfileApiPayload,
  type ChangePasswordRequest,
  type OnboardingRequest,
  type ProfileRequest,
  type UpdateAccountRequest,
  type UserProfileSummary,
  type UserProfileSummaryDto,
} from '@/types/profile'

export async function fetchProfile(): Promise<UserProfileSummary> {
  const { data } = await apiClient.get<UserProfileSummaryDto>('/profiles/me')
  return mapProfileSummaryDto(data)
}

export async function completeOnboarding(
  payload: OnboardingRequest,
): Promise<UserProfileSummary> {
  const { data } = await apiClient.put<UserProfileSummaryDto>(
    '/profiles/onboarding',
    toOnboardingApiPayload(payload),
  )
  return mapProfileSummaryDto(data)
}

export async function updateProfile(payload: ProfileRequest): Promise<UserProfileSummary> {
  const { data } = await apiClient.put<UserProfileSummaryDto>(
    '/profiles/me',
    toProfileApiPayload(payload),
  )
  return mapProfileSummaryDto(data)
}

export async function updateAccount(payload: UpdateAccountRequest): Promise<UserProfileSummary> {
  const { data } = await apiClient.patch<UserProfileSummaryDto>(
    '/profiles/me/account',
    payload,
  )
  return mapProfileSummaryDto(data)
}

export async function changePassword(payload: ChangePasswordRequest): Promise<void> {
  await apiClient.post('/auth/change-password', payload)
}

export async function deleteAccount(): Promise<void> {
  await apiClient.delete('/profiles/me', { withCredentials: true })
}
