<script setup lang="ts">
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputSwitch from 'primevue/inputswitch'
import Tag from 'primevue/tag'

import type { Product, ProductStatus } from '../models/product'

interface ProductsTableProps {
  products: Product[]
  isAdmin: boolean
  isLoading: boolean
  isDeletingProduct: boolean
  isUpdatingStatus: boolean
  placeholderImage: string
  formatCurrency: (value: number) => string
}

const props = defineProps<ProductsTableProps>()

const emit = defineEmits<{
  (event: 'edit', product: Product): void
  (event: 'delete', payload: { event: MouseEvent; product: Product }): void
  (event: 'toggle-status', product: Product): void
}>()

const statusSeverity = (status: ProductStatus) => (status === 'activated' ? 'success' : 'secondary')
const statusLabel = (status: ProductStatus) => (status === 'activated' ? 'Ativo' : 'Inativo')

const handleEdit = (product: Product) => {
  emit('edit', product)
}

const handleDelete = (event: MouseEvent, product: Product) => {
  emit('delete', { event, product })
}

const handleToggleStatus = (product: Product) => {
  emit('toggle-status', product)
}
</script>

<template>
  <DataTable
    :value="props.products"
    dataKey="id"
    :loading="props.isLoading"
    stripedRows
    responsiveLayout="stack"
    breakpoint="960px"
    :emptyMessage="props.isAdmin ? 'Nenhum produto cadastrado.' : 'Nenhum produto disponível.'"
  >
    <Column header="Imagem" style="width: 8rem">
      <template #body="{ data }">
        <img
          :src="data.image || props.placeholderImage"
          :alt="data.name"
          class="products-table__image"
        />
      </template>
    </Column>
    <Column field="name" header="Nome" sortable />
    <Column field="description" header="Descrição">
      <template #body="{ data }">
        <span class="products-table__description">
          {{ data.description || '—' }}
        </span>
      </template>
    </Column>
    <Column field="price" header="Preço" sortable style="width: 8rem">
      <template #body="{ data }">
        {{ props.formatCurrency(data.price) }}
      </template>
    </Column>
    <Column header="Status" style="width: 8rem">
      <template #body="{ data }">
        <Tag :value="statusLabel(data.status)" :severity="statusSeverity(data.status)" />
      </template>
    </Column>
    <Column header="Ações" style="width: 11rem">
      <template #body="{ data }">
        <div class="products-table__actions">
          <Button icon="pi pi-pencil" rounded text severity="info" @click="handleEdit(data)" />
          <Button
            v-if="props.isAdmin"
            icon="pi pi-trash"
            rounded
            text
            severity="danger"
            :disabled="props.isDeletingProduct"
            @click="(event) => handleDelete(event, data)"
          />
          <InputSwitch
            v-if="props.isAdmin"
            :modelValue="data.status === 'activated'"
            :disabled="props.isUpdatingStatus"
            @update:modelValue="() => handleToggleStatus(data)"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>
.products-table__image {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.products-table__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.products-table__description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #475569;
  font-size: 0.95rem;
}
</style>
