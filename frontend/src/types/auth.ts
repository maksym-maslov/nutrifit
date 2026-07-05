import type { UserProfileSummary } from '@/types/profile'

export interface User {
  email: string
  role: string
  profile: UserProfileSummary | null
}

export interface TokenResponse {
  accessToken: string
}

/** RFC 7807 ProblemDetail — shape returned by the backend GlobalExceptionHandler */
export interface ProblemDetail {
  type?: string
  title?: string
  status: number
  detail: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
}

/** Decoded JWT payload claims issued by the backend TokenService */
export interface JwtClaims {
  iss: string
  sub: string
  iat: number
  exp: number
  scope: string
}
