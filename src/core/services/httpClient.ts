import axios, { AxiosHeaders } from 'axios'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '../stores/auth.store'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

httpClient.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  const { rolePrefix } = storeToRefs(authStore)
  const token = authStore.currentUser?.token

  if (token) {
    const headers =
      config.headers instanceof AxiosHeaders
        ? config.headers
        : new AxiosHeaders(config.headers)

    headers.set('Authorization', `Bearer ${token}`)
    config.headers = headers
  }

  if (config.useRolePrefix ?? true) {
    const prefix = rolePrefix.value
    if (prefix !== '') {
      const safePath = config.url?.startsWith('/') ? config.url : `/${config.url ?? ''}`
      config.url = `${prefix}${safePath}`
    }
  }

  return config
})
