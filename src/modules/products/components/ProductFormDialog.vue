<script setup lang="ts">
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

import type { ProductPayload, ProductStatus } from '../models/product'

type DialogMode = 'create' | 'edit'

interface StatusOption {
  label: string
  value: ProductStatus
}

interface ProductFormDialogProps {
  mode: DialogMode
  statusOptions: StatusOption[]
  isAdmin: boolean
  isSavingProduct: boolean
  isFormValid: boolean
}

const props = defineProps<ProductFormDialogProps>()

const visible = defineModel<boolean>('visible', { required: true })
const form = defineModel<ProductPayload & { id?: number }>('form', { required: true })

const emit = defineEmits<{
  (event: 'hide'): void
  (event: 'save'): void
  (event: 'cancel'): void
}>()

const handleHide = () => {
  emit('hide')
}

const handleSubmit = () => {
  emit('save')
}

const handleCancel = () => {
  visible.value = false
  emit('cancel')
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :modal="true"
    :header="props.mode === 'create' ? 'Novo produto' : 'Editar produto'"
    class="products-dialog"
    @hide="handleHide"
  >
    <form class="products-form" @submit.prevent="handleSubmit">
      <div class="products-form__field">
        <label for="product-name">Nome</label>
        <InputText id="product-name" v-model="form.name" required autofocus />
      </div>

      <div class="products-form__field">
        <label for="product-price">Preço</label>
        <InputNumber
          id="product-price"
          inputId="product-price-input"
          v-model="form.price"
          mode="currency"
          currency="BRL"
          locale="pt-BR"
          :minFractionDigits="2"
        />
      </div>

      <div class="products-form__field">
        <label for="product-image">Imagem (URL)</label>
        <InputText id="product-image" v-model="form.image" placeholder="https://..." />
      </div>

      <div class="products-form__field">
        <label for="product-description">Descrição</label>
        <Textarea
          id="product-description"
          v-model="form.description"
          rows="3"
          autoResize
          placeholder="Detalhes do produto"
        />
      </div>

      <div class="products-form__field" v-if="props.isAdmin">
        <label for="product-status">Status</label>
        <Dropdown
          id="product-status"
          v-model="form.status"
          :options="props.statusOptions"
          optionLabel="label"
          optionValue="value"
        />
      </div>

      <div class="products-form__actions">
        <Button type="button" label="Cancelar" outlined severity="secondary" @click="handleCancel" />
        <Button
          type="submit"
          label="Salvar"
          icon="pi pi-check"
          :loading="props.isSavingProduct"
          :disabled="!props.isFormValid || props.isSavingProduct"
        />
      </div>
    </form>
  </Dialog>
</template>

<style scoped>
.products-dialog :deep(.p-dialog-content) {
  padding-top: 0 !important;
}

.products-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.products-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.products-form__field label {
  font-weight: 600;
  color: #0f172a;
}

.products-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}
</style>
