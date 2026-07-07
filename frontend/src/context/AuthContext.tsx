import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { apiClient, setAccessToken } from '@/api/apiClient'
import { fetchProfile } from '@/api/profileApi'
import type { User, JwtClaims, TokenResponse } from '@/types/auth'
import type { UserProfileSummary } from '@/types/profile'

// ---------------------------------------------------------------------------
// JWT decode helper — reads claims from the payload without verification
// (verification is the server's job; client only needs the claims for display)
// ---------------------------------------------------------------------------
function decodeJwt(token: string): JwtClaims {
  const payload = token.split('.')[1]
  const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
  return JSON.parse(json) as JwtClaims
}

function userFromToken(token: string, profile: UserProfileSummary | null = null): User {
  const claims = decodeJwt(token)
  return { email: claims.sub, role: claims.scope, profile }
}

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------
interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isOnboarded: boolean
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<UserProfileSummary | null>
  setProfileFromSummary: (summary: UserProfileSummary) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const isOnboarded = user?.profile?.onboarded ?? false

  const refreshProfile = useCallback(async (): Promise<UserProfileSummary | null> => {
    try {
      const profile = await fetchProfile()
      setUser((prev) => {
        if (!prev) return prev
        return { ...prev, profile }
      })
      return profile
    } catch {
      return null
    }
  }, [])

  const setProfileFromSummary = useCallback((summary: UserProfileSummary) => {
    setUser((prev) => {
      if (!prev) return prev
      return { ...prev, profile: summary }
    })
  }, [])

  const navigateAfterAuth = useCallback(
    (profile: UserProfileSummary | null) => {
      navigate(profile?.onboarded ? '/dashboard' : '/onboarding')
    },
    [navigate],
  )

  // On mount: silently attempt to restore session from the HttpOnly refresh cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await axios.post<TokenResponse>(
          '/api/v1/auth/refresh',
          null,
          { withCredentials: true },
        )
        setAccessToken(data.accessToken)
        const baseUser = userFromToken(data.accessToken)

        try {
          const profile = await fetchProfile()
          setUser({ ...baseUser, profile })
        } catch {
          setUser(baseUser)
        }
      } catch {
        // No valid session — user stays as guest
      } finally {
        setIsLoading(false)
      }
    }

    void restoreSession()
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await apiClient.post<TokenResponse>('/auth/login', {
        email,
        password,
      })
      setAccessToken(data.accessToken)
      const baseUser = userFromToken(data.accessToken)
      setUser(baseUser)

      let profile: UserProfileSummary | null = null
      try {
        profile = await fetchProfile()
        setUser({ ...baseUser, profile })
      } catch {
        // Profile fetch failed — still navigate based on null profile
      }

      navigateAfterAuth(profile)
    },
    [navigateAfterAuth],
  )

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      await apiClient.post('/auth/register', { fullName, email, password })
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout', null, { withCredentials: true })
    } catch {
      // Server unreachable — still clear local session below
    } finally {
      setAccessToken(null)
      setUser(null)
      navigate('/login')
    }
  }, [navigate])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isOnboarded,
        login,
        register,
        logout,
        refreshProfile,
        setProfileFromSummary,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return ctx
}
