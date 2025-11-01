<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import RadioButton from 'primevue/radiobutton'
import { useRouter } from 'vue-router'

import { useRegisterViewModel } from '../viewmodels/useRegisterViewModel'

const router = useRouter()
const {
  state,
  isFormValid,
  doPasswordsMatch,
  isPasswordLengthValid,
  isSubmitting,
  updateField,
  updateConfirmPassword,
  submit,
} = useRegisterViewModel()

const roles = [
  { label: 'Tenant', value: 'tenant' },
  { label: 'Admin', value: 'admin' },
]

const goToLogin = () => {
  router.push({ name: 'login' })
}

const handleSubmit = () => {
  submit()
}
</script>

<template>
  <main class="register">
    <Card class="register__card">
      <template #title>
        <div class="register__header">
          <span class="register__badge">Crie sua conta</span>
          <h1 class="register__title">Cadastro</h1>
          <p class="register__subtitle">Preencha os dados para acessar o painel de produtos.</p>
        </div>
      </template>
      <template #content>
        <form class="register__form" @submit.prevent="handleSubmit">
          <FloatLabel class="register__field">
            <InputText
              id="register-name"
              class="register__input"
              :model-value="state.form.name"
              placeholder=" "
              autocomplete="name"
              @update:modelValue="updateField('name', $event ?? '')"
            />
            <label for="register-name">Nome completo</label>
          </FloatLabel>

          <FloatLabel class="register__field">
            <InputText
              id="register-email"
              class="register__input"
              type="email"
              :model-value="state.form.email"
              placeholder=" "
              autocomplete="email"
              @update:modelValue="updateField('email', $event ?? '')"
            />
            <label for="register-email">E-mail</label>
          </FloatLabel>

          <FloatLabel class="register__field register__password">
            <Password
              inputId="register-password"
              class="register__input"
              :model-value="state.form.password"
              placeholder=" "
              :feedback="false"
              toggleMask
              autocomplete="new-password"
              :pt="{
                maskIcon: { 'data-testid': 'register-password-toggle' },
                unmaskIcon: { 'data-testid': 'register-password-toggle' },
              }"
              @update:modelValue="updateField('password', $event ?? '')"
            />
            <label for="register-password">Senha</label>
          </FloatLabel>
          <p v-if="!isPasswordLengthValid" class="register__hint">
            A senha deve ter pelo menos 3 caracteres.
          </p>

          <FloatLabel class="register__field register__password">
            <Password
              inputId="register-password-confirm"
              class="register__input"
              :model-value="state.confirmPassword"
              placeholder=" "
              :feedback="false"
              toggleMask
              autocomplete="new-password"
              :pt="{
                maskIcon: { 'data-testid': 'register-confirm-toggle' },
                unmaskIcon: { 'data-testid': 'register-confirm-toggle' },
              }"
              @update:modelValue="updateConfirmPassword($event ?? '')"
            />
            <label for="register-password-confirm">Confirmar senha</label>
          </FloatLabel>
          <p v-if="state.confirmPassword && !doPasswordsMatch" class="register__hint">
            As senhas devem ser iguais.
          </p>

          <div class="register__roles">
            <p>Perfil de acesso</p>
            <div class="register__roles-group">
              <div
                v-for="role in roles"
                :key="role.value"
                class="register__roles-option"
              >
                <RadioButton
                  :inputId="`role-${role.value}`"
                  name="role"
                  :value="role.value"
                  :model-value="state.form.role"
                  @update:modelValue="updateField('role', $event ?? 'tenant')"
                />
                <label :for="`role-${role.value}`">{{ role.label }}</label>
              </div>
            </div>
          </div>

          <Message
            v-if="state.errorMessage"
            severity="error"
            variant="simple"
            class="register__error"
          >
            {{ state.errorMessage }}
          </Message>


          <div class="register__actions">
            <Button
              type="button"
              label="Voltar"
              outlined
              severity="secondary"
              class="register__button"
              @click="goToLogin"
            />
            <Button
              type="submit"
              label="Cadastrar"
              icon="pi pi-user-plus"
              class="register__button"
              :loading="isSubmitting"
              :disabled="!isFormValid || isSubmitting"
            />
          </div>
        </form>
      </template>
    </Card>
  </main>
</template>

<style scoped>
.register {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background-color: #f3f4f6;
}

.register__card {
  width: min(100%, 480px);
  background-color: #ffffff;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.18);
  border: 1px solid rgba(203, 213, 225, 0.6);
}

.register__card :deep(.p-card-body) {
  padding: 2.5rem 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.register__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
}

.register__badge {
  background-color: rgba(17, 24, 39, 0.05);
  color: #111827;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.register__title {
  margin: 0;
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
}

.register__subtitle {
  margin: 0;
  color: #64748b;
}

.register__form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.register__field {
  width: 100%;
}

.register__input {
  width: 100%;
}

.register__password :deep(.p-password) {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
}

.register__password :deep(.p-password-input) {
  width: 100%;
  padding-right: 3rem;
}

.register__roles {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 1rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}

.register__roles p {
  margin: 0;
  font-weight: 600;
  color: #0f172a;
}

.register__roles-group {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.register__roles-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #475569;
}

.register__error {
  width: 100%;
  color: #dc2626;
}

.register__hint {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  color: #dc2626;
}

.register__actions {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.register__button {
  flex: 1;
  justify-content: center;
}

@media (max-width: 640px) {
  .register__card :deep(.p-card-body) {
    padding-inline: 1.5rem;
  }

  .register__actions {
    flex-direction: column;
  }
}
</style>
