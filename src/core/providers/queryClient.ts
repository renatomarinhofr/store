import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  },
})

export const vueQueryPlugin = {
  install(app: Parameters<typeof VueQueryPlugin['install']>[0]) {
    app.use(VueQueryPlugin, {
      queryClient,
    })
  },
}
