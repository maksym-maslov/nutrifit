import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import {
  changePassword,
  deleteAccount,
  fetchProfile,
  updateAccount,
  updateEmail,
  updateProfile,
} from '@/api/profileApi'
import { FormField } from '@/components/FormField'
import { TIMEZONE_OPTIONS } from '@/constants/timezones'
import { AppShell } from '@/components/layout/AppShell'
import {
  createNumberChangeHandler,
  ProfileBiometricsFields,
  validateBiometrics,
  type BiometricsFieldErrors,
} from '@/components/profile/ProfileBiometricsFields'
import {
  ProfileActivityFields,
  ProfileGoalFields,
  validateActivityLevel,
  validateFitnessGoal,
  type PlanFieldErrors,
} from '@/components/profile/ProfilePlanFields'
import { Spinner } from '@/components/ui/Spinner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Toast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import type { ProblemDetail } from '@/types/auth'
import {
  profileSummaryToFormData,
  DEFAULT_PROFILE_TIMEZONE,
  toProfileRequest,
  type ActivityLevel,
  type FitnessGoal,
  type Gender,
  type ProfileFormData,
  type UserProfileSummary,
} from '@/types/profile'

interface AccountFieldErrors {
  fullName?: string
}

interface PasswordFieldErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

interface EmailFieldErrors {
  newEmail?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const problem = err.response?.data as ProblemDetail | undefined
    return problem?.detail ?? fallback
  }
  return fallback
}

function MacroGoalsDisplay({ profile }: { profile: UserProfileSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border border-ink-border bg-ink-light/50 px-4 py-3">
        <p className="text-xs text-white/50">Calories</p>
        <p className="text-lg font-bold text-mint">{profile.goalCalories ?? '—'}</p>
      </div>
      <div className="rounded-xl border border-ink-border bg-ink-light/50 px-4 py-3">
        <p className="text-xs text-white/50">Protein (g)</p>
        <p className="text-lg font-bold text-white">{profile.goalProteinG ?? '—'}</p>
      </div>
      <div className="rounded-xl border border-ink-border bg-ink-light/50 px-4 py-3">
        <p className="text-xs text-white/50">Carbs (g)</p>
        <p className="text-lg font-bold text-white">{profile.goalCarbsG ?? '—'}</p>
      </div>
      <div className="rounded-xl border border-ink-border bg-ink-light/50 px-4 py-3">
        <p className="text-xs text-white/50">Fat (g)</p>
        <p className="text-lg font-bold text-white">{profile.goalFatG ?? '—'}</p>
      </div>
    </div>
  )
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { refreshProfile, logout, clearSession, setProfileFromSummary } = useAuth()

  const [profile, setProfile] = useState<UserProfileSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [accountErrors, setAccountErrors] = useState<AccountFieldErrors>({})
  const [isSavingAccount, setIsSavingAccount] = useState(false)

  const [formData, setFormData] = useState<ProfileFormData>({
    birthday: '',
    gender: null,
    heightCm: '',
    weightKg: '',
    fitnessGoal: null,
    activityLevel: null,
    timezone: DEFAULT_PROFILE_TIMEZONE,
  })
  const [biometricsErrors, setBiometricsErrors] = useState<BiometricsFieldErrors>({})
  const [goalErrors, setGoalErrors] = useState<Pick<PlanFieldErrors, 'fitnessGoal'>>({})
  const [activityErrors, setActivityErrors] = useState<Pick<PlanFieldErrors, 'activityLevel'>>({})
  const [profileServerError, setProfileServerError] = useState<string | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<PasswordFieldErrors>({})
  const [passwordServerError, setPasswordServerError] = useState<string | null>(null)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const [showEmailForm, setShowEmailForm] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailErrors, setEmailErrors] = useState<EmailFieldErrors>({})
  const [emailServerError, setEmailServerError] = useState<string | null>(null)
  const [isSavingEmail, setIsSavingEmail] = useState(false)

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true)
      setLoadError(null)
      try {
        const data = await fetchProfile()
        setProfile(data)
        setFullName(data.fullName ?? '')
        setFormData(profileSummaryToFormData(data))
      } catch (err) {
        setLoadError(getErrorMessage(err, 'Failed to load profile.'))
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfile()
  }, [])

  const clearBiometricsError = (field: keyof BiometricsFieldErrors) => {
    setBiometricsErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const handleNumberChange = createNumberChangeHandler(
    setFormData,
    clearBiometricsError,
    () => setProfileServerError(null),
  )

  const handleBirthdayChange = (birthday: string) => {
    setFormData((prev) => ({ ...prev, birthday }))
    clearBiometricsError('birthday')
    if (profileServerError) setProfileServerError(null)
  }

  const handleGenderSelect = (gender: Gender) => {
    setFormData((prev) => ({ ...prev, gender }))
    clearBiometricsError('gender')
    if (profileServerError) setProfileServerError(null)
  }

  const handleTimezoneChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, timezone: e.target.value }))
    if (profileServerError) setProfileServerError(null)
  }

  const handleGoalSelect = (fitnessGoal: FitnessGoal) => {
    setFormData((prev) => ({ ...prev, fitnessGoal }))
    setGoalErrors({})
    if (profileServerError) setProfileServerError(null)
  }

  const handleActivitySelect = (activityLevel: ActivityLevel) => {
    setFormData((prev) => ({ ...prev, activityLevel }))
    setActivityErrors({})
    if (profileServerError) setProfileServerError(null)
  }

  const handleAccountSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errors: AccountFieldErrors = {}
    if (!fullName.trim()) {
      errors.fullName = 'Full name is required.'
    }
    if (Object.keys(errors).length > 0) {
      setAccountErrors(errors)
      return
    }

    setIsSavingAccount(true)
    setAccountErrors({})
    try {
      const updated = await updateAccount({ fullName: fullName.trim() })
      setProfile(updated)
      setProfileFromSummary(updated)
      setToastMessage('Account updated.')
    } catch (err) {
      setAccountErrors({ fullName: getErrorMessage(err, 'Failed to update account.') })
    } finally {
      setIsSavingAccount(false)
    }
  }

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const bioErrors = validateBiometrics(formData)
    const goalErrs = validateFitnessGoal(formData)
    const activityErrs = validateActivityLevel(formData)

    setBiometricsErrors(bioErrors)
    setGoalErrors(goalErrs)
    setActivityErrors(activityErrs)

    if (
      Object.keys(bioErrors).length > 0 ||
      Object.keys(goalErrs).length > 0 ||
      Object.keys(activityErrs).length > 0
    ) {
      return
    }

    setIsSavingProfile(true)
    setProfileServerError(null)

    try {
      const request = toProfileRequest(formData)
      const updated = await updateProfile(request)
      setProfile(updated)
      setProfileFromSummary(updated)
      await refreshProfile()
      setToastMessage('Profile updated. Your macro goals have been recalculated.')
    } catch (err) {
      setProfileServerError(getErrorMessage(err, 'Failed to update profile.'))
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errors: PasswordFieldErrors = {}

    if (!currentPassword) {
      errors.currentPassword = 'Current password is required.'
    }
    if (!newPassword) {
      errors.newPassword = 'New password is required.'
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters.'
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password.'
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.'
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    setIsSavingPassword(true)
    setPasswordErrors({})
    setPasswordServerError(null)

    try {
      await changePassword({ currentPassword, newPassword })
      setToastMessage('Password changed. Please sign in again.')
      setTimeout(() => logout(), 1500)
    } catch (err) {
      setPasswordServerError(getErrorMessage(err, 'Failed to change password.'))
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handlePasswordFieldChange =
    (field: 'currentPassword' | 'newPassword' | 'confirmPassword') =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (field === 'currentPassword') setCurrentPassword(value)
      if (field === 'newPassword') setNewPassword(value)
      if (field === 'confirmPassword') setConfirmPassword(value)
      setPasswordErrors((prev) => ({ ...prev, [field]: undefined }))
      if (passwordServerError) setPasswordServerError(null)
    }

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const errors: EmailFieldErrors = {}
    const trimmedEmail = newEmail.trim()

    if (!trimmedEmail) {
      errors.newEmail = 'Email is required.'
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      errors.newEmail = 'Enter a valid email address.'
    }

    if (Object.keys(errors).length > 0) {
      setEmailErrors(errors)
      return
    }

    setIsSavingEmail(true)
    setEmailErrors({})
    setEmailServerError(null)

    try {
      await updateEmail({ newEmail: trimmedEmail })
      setToastMessage('Email updated. Please check your inbox to verify.')
      clearSession()
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setEmailErrors({ newEmail: getErrorMessage(err, 'Email already in use.') })
      } else {
        setEmailServerError(getErrorMessage(err, 'Failed to update email.'))
      }
    } finally {
      setIsSavingEmail(false)
    }
  }

  const handleCancelEmailEdit = () => {
    setShowEmailForm(false)
    setNewEmail('')
    setEmailErrors({})
    setEmailServerError(null)
  }

  const handleConfirmDeleteAccount = async () => {
    setIsDeletingAccount(true)
    try {
      await deleteAccount()
      clearSession()
      navigate('/register')
    } catch (err) {
      setToastMessage(getErrorMessage(err, 'Failed to delete account. Please try again.'))
    } finally {
      setIsDeletingAccount(false)
      setShowDeleteDialog(false)
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      </AppShell>
    )
  }

  if (loadError) {
    return (
      <AppShell>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {loadError}
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />

      {showDeleteDialog && (
        <ConfirmDialog
          isOpen
          title="Delete account?"
          message="Are you absolutely sure? This will permanently delete all your meals, workouts, and profile data. This action cannot be undone."
          confirmLabel="Delete account"
          isConfirming={isDeletingAccount}
          onConfirm={handleConfirmDeleteAccount}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}

      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Profile</h1>
            <p className="mt-1 text-sm text-white/50">Manage your account and fitness plan</p>
          </div>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-mint hover:text-mint-dark transition-colors"
          >
            Back to dashboard
          </Link>
        </div>

        <section className="rounded-2xl border border-ink-border bg-ink-light/30 p-5">
          <h2 className="text-lg font-semibold text-white">Account</h2>
          <p className="mt-1 text-sm text-white/50">Your login details</p>

          <form onSubmit={handleAccountSubmit} noValidate className="mt-5 flex flex-col gap-4">
            <FormField
              id="fullName"
              label="Full name"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value)
                setAccountErrors({})
              }}
              error={accountErrors.fullName}
            />
            <button
              type="submit"
              disabled={isSavingAccount}
              className={[
                'self-start rounded-xl px-5 py-3 text-sm font-bold tracking-wide transition-all duration-200',
                'bg-mint text-ink hover:bg-mint-dark active:scale-[0.98]',
                'disabled:cursor-not-allowed disabled:opacity-60',
              ].join(' ')}
            >
              {isSavingAccount ? 'Saving…' : 'Save account'}
            </button>
          </form>

          <div className="mt-6 border-t border-ink-border pt-5">
            <button
              type="button"
              onClick={() => setShowPasswordForm((prev) => !prev)}
              className="text-sm font-medium text-mint hover:text-mint-dark transition-colors"
            >
              {showPasswordForm ? 'Hide password change' : 'Change password'}
            </button>

            {showPasswordForm && (
              <form onSubmit={handlePasswordSubmit} noValidate className="mt-4 flex flex-col gap-4">
                <FormField
                  id="currentPassword"
                  label="Current password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={handlePasswordFieldChange('currentPassword')}
                  error={passwordErrors.currentPassword}
                />
                <FormField
                  id="newPassword"
                  label="New password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={handlePasswordFieldChange('newPassword')}
                  error={passwordErrors.newPassword}
                />
                <FormField
                  id="confirmPassword"
                  label="Confirm new password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={handlePasswordFieldChange('confirmPassword')}
                  error={passwordErrors.confirmPassword}
                />
                {passwordServerError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {passwordServerError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className={[
                    'self-start rounded-xl border border-ink-border px-5 py-3 text-sm font-semibold text-white/70',
                    'transition-all duration-200 hover:border-mint/40 hover:text-white',
                    'disabled:cursor-not-allowed disabled:opacity-60',
                  ].join(' ')}
                >
                  {isSavingPassword ? 'Updating…' : 'Update password'}
                </button>
              </form>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-ink-border bg-ink-light/30 p-5">
          <h2 className="text-lg font-semibold text-white">Email & Security</h2>
          <p className="mt-1 text-sm text-white/50">Manage your login email address</p>

          <div className="mt-5 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-white/50">Current email</p>
                <p className="mt-1 text-sm font-medium text-white">{profile?.email ?? '—'}</p>
              </div>
              {!showEmailForm && (
                <button
                  type="button"
                  onClick={() => setShowEmailForm(true)}
                  className="text-sm font-medium text-mint hover:text-mint-dark transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {showEmailForm && (
              <form onSubmit={handleEmailSubmit} noValidate className="flex flex-col gap-4">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  Changing your email will log you out immediately. You will need to verify your
                  new email address before logging back in.
                </div>
                <FormField
                  id="newEmail"
                  label="New email"
                  type="email"
                  autoComplete="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value)
                    setEmailErrors({})
                    if (emailServerError) setEmailServerError(null)
                  }}
                  error={emailErrors.newEmail}
                />
                {emailServerError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {emailServerError}
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isSavingEmail}
                    className={[
                      'rounded-xl px-5 py-3 text-sm font-bold tracking-wide transition-all duration-200',
                      'bg-mint text-ink hover:bg-mint-dark active:scale-[0.98]',
                      'disabled:cursor-not-allowed disabled:opacity-60',
                    ].join(' ')}
                  >
                    {isSavingEmail ? 'Updating…' : 'Update email'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEmailEdit}
                    disabled={isSavingEmail}
                    className={[
                      'rounded-xl border border-ink-border px-5 py-3 text-sm font-semibold text-white/70',
                      'transition-all duration-200 hover:border-mint/40 hover:text-white',
                      'disabled:cursor-not-allowed disabled:opacity-60',
                    ].join(' ')}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        <form onSubmit={handleProfileSubmit} noValidate className="flex flex-col gap-8">
          <section className="rounded-2xl border border-ink-border bg-ink-light/30 p-5">
            <h2 className="text-lg font-semibold text-white">Biometrics</h2>
            <p className="mt-1 text-sm text-white/50">Used to calculate your daily targets</p>
            <div className="mt-5">
              <ProfileBiometricsFields
                formData={formData}
                errors={biometricsErrors}
                onBirthdayChange={handleBirthdayChange}
                onNumberChange={handleNumberChange}
                onGenderSelect={handleGenderSelect}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-ink-border bg-ink-light/30 p-5">
            <h2 className="text-lg font-semibold text-white">Fitness goal</h2>
            <p className="mt-1 text-sm text-white/50">What you want to achieve</p>
            <div className="mt-5">
              <ProfileGoalFields
                formData={formData}
                errors={goalErrors}
                onGoalSelect={handleGoalSelect}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-ink-border bg-ink-light/30 p-5">
            <h2 className="text-lg font-semibold text-white">Timezone</h2>
            <p className="mt-1 text-sm text-white/50">
              Daily summaries use this timezone for your calendar day
            </p>
            <div className="mt-5 flex flex-col gap-1.5">
              <label htmlFor="timezone" className="text-sm font-medium text-white/70">
                Timezone
              </label>
              <select
                id="timezone"
                value={formData.timezone}
                onChange={handleTimezoneChange}
                className={[
                  'w-full rounded-xl border border-ink-border bg-ink px-4 py-3 text-sm text-white',
                  'outline-none transition-all duration-200',
                  'focus:border-mint focus:ring-2 focus:ring-mint/20',
                ].join(' ')}
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="rounded-2xl border border-ink-border bg-ink-light/30 p-5">
            <h2 className="text-lg font-semibold text-white">Activity level</h2>
            <p className="mt-1 text-sm text-white/50">How active you are each week</p>
            <div className="mt-5">
              <ProfileActivityFields
                formData={formData}
                errors={activityErrors}
                onActivitySelect={handleActivitySelect}
              />
            </div>
          </section>

          {profileServerError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {profileServerError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSavingProfile}
            className={[
              'rounded-xl px-5 py-3.5 text-sm font-bold tracking-wide transition-all duration-200',
              'bg-mint text-ink hover:bg-mint-dark active:scale-[0.98]',
              'disabled:cursor-not-allowed disabled:opacity-60',
            ].join(' ')}
          >
            {isSavingProfile ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                Saving profile…
              </span>
            ) : (
              'Save profile & recalculate plan'
            )}
          </button>
        </form>

        {profile && (
          <section className="rounded-2xl border border-ink-border bg-ink-light/30 p-5">
            <h2 className="text-lg font-semibold text-white">Your plan</h2>
            <p className="mt-1 text-sm text-white/50">Daily macro targets based on your profile</p>
            <div className="mt-5">
              <MacroGoalsDisplay profile={profile} />
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
          <h2 className="text-lg font-semibold text-red-300">Danger zone</h2>
          <p className="mt-1 text-sm text-white/50">
            Permanently delete your account and all associated data.
          </p>
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isDeletingAccount}
            className={[
              'mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300',
              'transition-all duration-200 hover:bg-red-500/20 active:scale-[0.98]',
              'disabled:cursor-not-allowed disabled:opacity-60',
            ].join(' ')}
          >
            Delete account
          </button>
        </section>
      </div>
    </AppShell>
  )
}
