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
import type { User, JwtClaims, TokenResponse } from '@/types/auth'

// ---------------------------------------------------------------------------
// JWT decode helper — reads claims from the payload without verification
// (verification is the server's job; client only needs the claims for display)
// ---------------------------------------------------------------------------
function decodeJwt(token: string): JwtClaims {
  const payload = token.split('.')[1]
  const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
  return JSON.parse(json) as JwtClaims
}

function userFromToken(token: string): User {
  const claims = decodeJwt(token)
  return { email: claims.sub, role: claims.scope }
}

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------
interface AuthContextValue {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

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
        setUser(userFromToken(data.accessToken))
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
      setUser(userFromToken(data.accessToken))
      navigate('/dashboard')
    },
    [navigate],
  )

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      await apiClient.post('/auth/register', { fullName, email, password })
    },
    [],
  )

  const logout = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    navigate('/login')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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
