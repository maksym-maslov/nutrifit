import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { TokenResponse } from '@/types/auth'

// ---------------------------------------------------------------------------
// In-memory access token store (never persisted to localStorage/sessionStorage)
// ---------------------------------------------------------------------------
let accessToken: string | null = null

export const getAccessToken = (): string | null => accessToken

export const setAccessToken = (token: string | null): void => {
  accessToken = token
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// ---------------------------------------------------------------------------
// Request interceptor — attach Bearer token if present
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// ---------------------------------------------------------------------------
// 401 refresh-retry interceptor
// ---------------------------------------------------------------------------
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

function onRefreshSuccess(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken))
  refreshSubscribers = []
}

function onRefreshFailure() {
  refreshSubscribers = []
  setAccessToken(null)
  // Redirect to login — avoid importing navigate here to keep this module framework-agnostic
  window.location.href = '/login'
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error)

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Only intercept 401s that haven't already been retried
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Skip the interceptor for the refresh endpoint itself to avoid loops
    if (originalRequest.url?.includes('/auth/refresh')) {
      onRefreshFailure()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Queue this request until the ongoing refresh completes
      return new Promise<AxiosResponse>((resolve, reject) => {
        subscribeTokenRefresh((newToken: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
          }
          originalRequest._retry = true
          apiClient(originalRequest).then(resolve).catch(reject)
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post<TokenResponse>(
        '/api/v1/auth/refresh',
        null,
        { withCredentials: true },
      )
      const newToken = data.accessToken
      setAccessToken(newToken)
      onRefreshSuccess(newToken)

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
      }
      return apiClient(originalRequest)
    } catch {
      onRefreshFailure()
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  },
)
