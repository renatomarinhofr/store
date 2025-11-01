<script setup lang="ts">
import Button from 'primevue/button'
import Card from 'primevue/card'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToLogin = () => {
  router.push({ name: 'login' })
}
</script>

<template>
  <main class="register">
    <Card class="register__card">
      <template #title>
        <div class="register__header">
          <span class="register__badge">Em breve</span>
          <h1 class="register__title">Cadastro</h1>
          <p class="register__subtitle">Funcionalidade em construção.</p>
        </div>
      </template>
      <template #content>
        <p class="register__description">
          Enquanto isso, utilize suas credenciais para acessar o sistema com a conta existente.
        </p>
        <Button
          type="button"
          class="register__back"
          label="Voltar para o login"
          @click="goToLogin"
        />
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
}

.register__card {
  width: min(100%, 420px);
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

.register__description {
  margin: 0;
  color: #6b7280;
  text-align: center;
}

.register__back {
  width: 100%;
  justify-content: center;
}
</style>
