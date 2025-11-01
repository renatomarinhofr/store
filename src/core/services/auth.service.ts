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
  // placeholder for future logout rules (e.g. revoke token endpoint)
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
