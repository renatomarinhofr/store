import { computed, reactive } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { login as loginService } from '@/core/services'
import { useAuthStore } from '@/core/stores'
import type { UserCredentials } from '../models/auth'

interface LoginViewModelState {
  form: UserCredentials
  errorMessage: string | null
}

export function useLoginViewModel() {
  const router = useRouter()
  const authStore = useAuthStore()
  const queryClient = useQueryClient()

  const state = reactive<LoginViewModelState>({
    form: {
      email: '',
      password: '',
    },
    errorMessage: null,
  })

  const isFormValid = computed(() => state.form.email !== '' && state.form.password !== '')

  const loginMutation = useMutation({
    mutationFn: loginService,
    onSuccess(user) {
      authStore.setUser(user)
      state.errorMessage = null
      queryClient.invalidateQueries({ queryKey: ['products'] })
      router.push({ name: 'products' })
    },
    onError(error: unknown) {
      state.errorMessage = error instanceof Error ? error.message : 'Não foi possível efetuar o login.'
    },
  })

  const isSubmitting = computed(() => loginMutation.isPending.value)

  const updateField = (field: keyof UserCredentials, value: string) => {
    state.form[field] = value
    if (state.errorMessage) {
      state.errorMessage = null
    }
  }

  const submit = () => {
    if (!isFormValid.value) {
      return
    }
    loginMutation.mutate({
      email: state.form.email.trim(),
      password: state.form.password,
    })
  }

  return {
    state,
    isFormValid,
    isSubmitting,
    updateField,
    submit,
  }
}
