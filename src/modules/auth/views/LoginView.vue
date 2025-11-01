<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import FloatLabel from 'primevue/floatlabel'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import { useRouter } from 'vue-router'

import { useLoginViewModel } from '../viewmodels/useLoginViewModel'

const router = useRouter()
const { state, isFormValid, isSubmitting, updateField, submit } = useLoginViewModel()

const handleSubmit = () => {
  submit()
}

const handleNavigateToRegister = () => {
  router.push({ name: 'register' })
}
</script>

<template>
  <main class="login">
    <Card class="login__card">
      <template #title>
        <div class="login__header">
          <span class="login__badge">Store Manager</span>
          <h1 class="login__title">Acessar conta</h1>
          <p class="login__subtitle">Digite suas credenciais para acessar sua conta.</p>
        </div>
      </template>
      <template #content>
        <form class="login__form" @submit.prevent="handleSubmit">
          <FloatLabel class="login__field">
            <InputText
              id="login-email"
              type="email"
              class="login__input"
              placeholder=" "
              autocomplete="email"
              :model-value="state.form.email"
              @update:modelValue="updateField('email', $event ?? '')"
            />
            <label for="login-email">Email</label>
          </FloatLabel>

          <FloatLabel class="login__field login__password">
            <Password
              inputId="login-password"
              class="login__input"
              placeholder=" "
              :feedback="false"
              toggleMask
              autocomplete="current-password"
              :model-value="state.form.password"
              :pt="{
                maskIcon: {
                  'data-testid': 'password-toggle',
                },
                unmaskIcon: {
                  'data-testid': 'password-toggle',
                },
              }"
              @update:modelValue="updateField('password', $event ?? '')"
            />
            <label for="login-password">Senha</label>
          </FloatLabel>

          <Message
            v-if="state.errorMessage"
            severity="error"
            class="login__message"
            variant="simple"
          >
            {{ state.errorMessage }}
          </Message>

          <Button
            type="submit"
            class="login__submit"
            :loading="isSubmitting"
            :disabled="!isFormValid"
            label="Entrar"
          />
        </form>
      </template>
      <template #footer>
        <div class="login__footer">
          <span class="login__footer-text">Não tem uma conta?</span>
          <Button
            type="button"
            class="login__register"
            label="Registrar"
            link
            @click="handleNavigateToRegister"
          />
        </div>
      </template>
    </Card>
  </main>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.login__card {
  width: min(100%, 420px);
  background-color: #ffffff;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.18);
  border: 1px solid rgba(203, 213, 225, 0.6);
}

.login__card :deep(.p-card-body) {
  padding: 2.5rem 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.login__card :deep(.p-card-footer) {
  padding: 0 2.5rem 2.5rem;
  background: transparent;
  border-top: 1px solid rgba(226, 232, 240, 0.75);
  display: flex;
  justify-content: center;
  gap: 0.35rem;
}

.login__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
}

.login__badge {
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.login__title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
}

.login__subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.95rem;
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.login__field {
  width: 100%;
}

.login__input {
  width: 100%;
}

.login__field :deep(label) {
  color: #64748b;
  font-weight: 500;
}

.login__field :deep(.p-inputtext:focus ~ label),
.login__field :deep(.p-inputtext.p-filled ~ label),
.login__field :deep(.p-password-input:focus ~ label),
.login__field :deep(.p-password-input.p-filled ~ label) {
  color: #0f172a;
}

.login__password :deep(.p-password) {
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
}

.login__password :deep(.p-password-input) {
  width: 100%;
  padding-right: 3rem;
}

.login__password :deep(.p-password-toggle-mask) {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: transparent !important;
  border: none !important;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.login__message {
  width: 100%;
  color: #dc2626;
}

.login__submit {
  width: 100%;
  justify-content: center;
}

.login__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #64748b;
}

.login__register {
  font-weight: 600;
  padding: 0.35rem 0.5rem;
}
</style>
