import { isAxiosError } from 'axios'

import type {
  AuthenticatedUser,
  AuthResponse,
  RegisterPayload,
  UserCredentials,
} from '@/modules/auth/models/auth'

import { httpClient } from './httpClient'
import { createFakeJwt } from '../utils/jwt'

export async function login(credentials: UserCredentials): Promise<AuthenticatedUser> {
  try {
    const { data } = await httpClient.post<AuthResponse>(
      '/login',
      credentials,
      {
        useRolePrefix: false,
      },
    )

    const issuedAt = Math.floor(Date.now() / 1000)
    const expiresAt = issuedAt + 60 * 60 // 1 hour expiry window for the fake token

    const fakeToken = createFakeJwt({
      email: credentials.email,
      role: data.role,
      iat: issuedAt,
      exp: expiresAt,
      providerToken: data.token,
    })

    return {
      email: credentials.email,
      role: data.role,
      token: fakeToken,
      providerToken: data.token,
    }
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const message =
        typeof error.response.data?.message === 'string'
          ? error.response.data.message
          : 'Não foi possível efetuar o login.'
      throw new Error(message)
    }
    throw error
  }
}

export function logout(): void {
  void httpClient
    .post(
      '/logout',
      {},
      {
        useRolePrefix: false,
      },
    )
    .catch((error) => {
      if (isAxiosError(error)) {
        console.warn('Falha ao revogar sessão remota.', error.response?.data ?? error.message)
      } else {
        console.warn('Falha ao revogar sessão remota.', error)
      }
    })

  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('store.e2e.autoConfirmDelete')
    window.localStorage.removeItem('store.auth.user')
  }
}

export async function registerUser(payload: RegisterPayload): Promise<void> {
  try {
    await httpClient.post(
      '/register',
      {
        ...payload,
        createdAt: new Date().toISOString(),
      },
      {
        useRolePrefix: false,
      },
    )
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      const message =
        typeof error.response.data?.message === 'string'
          ? error.response.data.message
          : 'Não foi possível concluir o cadastro.'
      throw new Error(message)
    }
    throw error
  }
}
