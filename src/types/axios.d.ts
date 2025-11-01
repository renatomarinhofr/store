import 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    useRolePrefix?: boolean
  }
}
