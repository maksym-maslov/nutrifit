import { AuthLayout } from '@/components/AuthLayout'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export function OnboardingPage() {
  return (
    <AuthLayout>
      <OnboardingWizard />
    </AuthLayout>
  )
}
