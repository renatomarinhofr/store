export interface UserCredentials {
  email: string
  password: string
}

export type UserRole = 'admin' | 'tenant'

export interface AuthResponse {
  token: string
  role: UserRole
}

export interface AuthenticatedUser {
  email: string
  role: UserRole
  token: string
  providerToken?: string
}

export interface AuthState {
  currentUser: AuthenticatedUser | null
}
