import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { AuthenticatedUser, UserRole } from '@/modules/auth/models/auth'

const USER_STORAGE_KEY = 'store.auth.user'

const loadPersistedUser = (): AuthenticatedUser | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const stored = window.localStorage.getItem(USER_STORAGE_KEY)
  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored) as AuthenticatedUser
  } catch (error) {
    console.warn('Failed to parse persisted user.', error)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<AuthenticatedUser | null>(loadPersistedUser())

  const isAuthenticated = computed(() => currentUser.value !== null)
  const role = computed<UserRole | null>(() => currentUser.value?.role ?? null)
  const rolePrefix = computed(() => {
    if (!role.value) {
      return ''
    }

    return `/${role.value}`
  })

  const setUser = (user: AuthenticatedUser | null) => {
    currentUser.value = user
    if (typeof window !== 'undefined') {
      if (user) {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      } else {
        window.localStorage.removeItem(USER_STORAGE_KEY)
      }
    }
  }

  const clear = () => {
    currentUser.value = null
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(USER_STORAGE_KEY)
    }
  }

  return {
    currentUser,
    isAuthenticated,
    role,
    rolePrefix,
    setUser,
    clear,
  }
})
