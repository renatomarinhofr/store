import { computed, reactive } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { registerUser } from '@/core/services'
import type { RegisterPayload } from '@/modules/auth/models/auth'

interface RegisterViewModelState {
  form: RegisterPayload
  confirmPassword: string
  errorMessage: string | null
}

const defaultForm = (): RegisterPayload => ({
  name: '',
  email: '',
  password: '',
  role: 'tenant',
})

export function useRegisterViewModel() {
  const router = useRouter()

  const state = reactive<RegisterViewModelState>({
    form: defaultForm(),
    confirmPassword: '',
    errorMessage: null,
  })

  const isPasswordLengthValid = computed(() => state.form.password.length >= 3)
  const doPasswordsMatch = computed(() => state.form.password === state.confirmPassword)

  const isFormValid = computed(() => {
    const { name, email, password } = state.form
    const hasRequiredFields = name.trim() !== '' && email.trim() !== '' && password.length >= 3
    return hasRequiredFields && doPasswordsMatch.value
  })

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess() {
      state.errorMessage = null
      router.push({ name: 'login', query: { registered: 'true' } })
    },
    onError(error: unknown) {
      state.errorMessage =
        error instanceof Error ? error.message : 'Não foi possível concluir o cadastro.'
    },
  })

  const isSubmitting = computed(() => registerMutation.isPending.value)

  const updateField = (field: keyof RegisterPayload, value: string) => {
    if (field === 'role') {
      if (value === 'admin' || value === 'tenant') {
        state.form.role = value
      }
      return
    }
    state.form[field] = value as RegisterPayload[keyof RegisterPayload]
    if (state.errorMessage) {
      state.errorMessage = null
    }
  }

  const updateConfirmPassword = (value: string) => {
    state.confirmPassword = value
    if (state.errorMessage) {
      state.errorMessage = null
    }
  }

  const submit = () => {
    if (!isFormValid.value) {
      return
    }
    registerMutation.mutate({ ...state.form })
  }

  return {
    state,
    isFormValid,
    doPasswordsMatch,
    isPasswordLengthValid,
    isSubmitting,
    updateField,
    updateConfirmPassword,
    submit,
  }
}
