<script setup lang="ts">
import Button from 'primevue/button'

import type { AuthenticatedUser } from '@/modules/auth/models/auth'

interface ProductsHeaderProps {
  currentUser: AuthenticatedUser | null
}

const props = defineProps<ProductsHeaderProps>()

const emit = defineEmits<{
  (event: 'create'): void
  (event: 'logout'): void
}>()

const handleCreate = () => {
  emit('create')
}

const handleLogout = () => {
  emit('logout')
}
</script>

<template>
  <header class="products-header">
    <div class="products-header__info">
      <h1>Produtos</h1>
      <p v-if="props.currentUser" class="products-header__subtitle">
        Logado como
        <strong>{{ props.currentUser.email }}</strong>
        ({{ props.currentUser.role }})
      </p>
    </div>

    <div class="products-header__actions">
      <Button
        label="Novo Produto"
        icon="pi pi-plus"
        class="products-header__button"
        @click="handleCreate"
      />
      <Button
        label="Sair"
        icon="pi pi-sign-out"
        severity="secondary"
        outlined
        class="products-header__button"
        @click="handleLogout"
      />
    </div>
  </header>
</template>

<style scoped>
.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.products-header__info h1 {
  margin: 0;
  font-size: 2.25rem;
  font-weight: 700;
  color: #0f172a;
}

.products-header__subtitle {
  margin: 0.25rem 0 0;
  color: #475569;
  font-size: 0.95rem;
}

.products-header__subtitle strong {
  font-weight: 600;
  color: #0f172a;
}

.products-header__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.products-header__button {
  min-width: 8rem;
}

@media (max-width: 768px) {
  .products-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .products-header__actions {
    width: 100%;
  }

  .products-header__button {
    flex: 1;
  }
}
</style>
