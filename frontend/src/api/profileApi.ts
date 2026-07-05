import { apiClient } from '@/api/apiClient'
import {
  mapProfileSummaryDto,
  toOnboardingApiPayload,
  type OnboardingRequest,
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
