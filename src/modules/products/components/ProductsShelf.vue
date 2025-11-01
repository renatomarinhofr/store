<script setup lang="ts">
import { ref } from 'vue'

import Tag from 'primevue/tag'

import type { Product, ProductStatus } from '../models/product'

interface ProductsShelfProps {
  activeProducts: Product[]
  inactiveProducts: Product[]
  isAdmin: boolean
  placeholderImage: string
  formatCurrency: (value: number) => string
}

const props = defineProps<ProductsShelfProps>()

const emit = defineEmits<{
  (event: 'drop', payload: { productId: number; status: ProductStatus }): void
  (event: 'context-menu', payload: { event: MouseEvent; product: Product }): void
}>()

const dragOverStatus = ref<ProductStatus | null>(null)

const handleContextMenu = (event: MouseEvent, product: Product) => {
  emit('context-menu', { event, product })
}

const handleDragStart = (event: DragEvent, product: Product) => {
  if (!props.isAdmin) {
    return
  }
  event.dataTransfer?.setData('text/plain', String(product.id))
}

const handleDragEnter = (status: ProductStatus) => {
  if (!props.isAdmin) {
    return
  }
  dragOverStatus.value = status
}

const handleDragLeave = () => {
  dragOverStatus.value = null
}

const handleDrop = (event: DragEvent, status: ProductStatus) => {
  if (!props.isAdmin) {
    return
  }

  dragOverStatus.value = null

  const productId = Number(event.dataTransfer?.getData('text/plain'))
  if (!productId) {
    return
  }

  emit('drop', { productId, status })
}
</script>

<template>
  <div class="products-shelf">
    <section
      class="products-shelf__column"
      :class="{
        'products-shelf__column--droppable': dragOverStatus === 'activated',
        'products-shelf__column--disabled': !props.isAdmin,
      }"
      @dragenter.prevent="handleDragEnter('activated')"
      @dragover.prevent
      @dragleave="handleDragLeave"
      @drop.prevent="(event) => handleDrop(event, 'activated')"
    >
      <header class="products-shelf__header">
        <h2>Produtos ativos</h2>
        <span>{{ props.activeProducts.length }}</span>
      </header>

      <p v-if="props.activeProducts.length === 0" class="products-shelf__empty">
        Nenhum produto ativo.
      </p>

      <article
        v-for="product in props.activeProducts"
        :key="product.id"
        class="products-shelf__card"
        :draggable="props.isAdmin"
        @dragstart="(event) => handleDragStart(event, product)"
        @contextmenu.prevent="(event) => handleContextMenu(event, product)"
      >
        <img
          :src="product.image || props.placeholderImage"
          :alt="product.name"
          class="products-shelf__card-image"
        />
        <div class="products-shelf__card-content">
          <div class="products-shelf__card-header">
            <h3>{{ product.name }}</h3>
            <Tag :value="props.formatCurrency(product.price)" severity="success" />
          </div>
          <p class="products-shelf__card-description">
            {{ product.description || 'Sem descrição.' }}
          </p>
        </div>
      </article>
    </section>

    <section
      class="products-shelf__column"
      :class="{
        'products-shelf__column--droppable': dragOverStatus === 'disabled',
        'products-shelf__column--disabled': !props.isAdmin,
      }"
      @dragenter.prevent="handleDragEnter('disabled')"
      @dragover.prevent
      @dragleave="handleDragLeave"
      @drop.prevent="(event) => handleDrop(event, 'disabled')"
    >
      <header class="products-shelf__header">
        <h2>Produtos inativos</h2>
        <span>{{ props.inactiveProducts.length }}</span>
      </header>

      <p v-if="props.inactiveProducts.length === 0" class="products-shelf__empty">
        Nenhum produto inativo.
      </p>

      <article
        v-for="product in props.inactiveProducts"
        :key="product.id"
        class="products-shelf__card"
        :draggable="props.isAdmin"
        @dragstart="(event) => handleDragStart(event, product)"
        @contextmenu.prevent="(event) => handleContextMenu(event, product)"
      >
        <img
          :src="product.image || props.placeholderImage"
          :alt="product.name"
          class="products-shelf__card-image"
        />
        <div class="products-shelf__card-content">
          <div class="products-shelf__card-header">
            <h3>{{ product.name }}</h3>
            <Tag :value="props.formatCurrency(product.price)" severity="secondary" />
          </div>
          <p class="products-shelf__card-description">
            {{ product.description || 'Sem descrição.' }}
          </p>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.products-shelf {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.products-shelf__column {
  background-color: #ffffff;
  border-radius: 1rem;
  padding: 1.25rem;
  border: 2px dashed transparent;
  min-height: 360px;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.products-shelf__column--droppable {
  border-color: #0f172a;
  background-color: #f8fafc;
}

.products-shelf__column--disabled {
  cursor: not-allowed;
  opacity: 0.9;
}

.products-shelf__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: #0f172a;
}

.products-shelf__header h2 {
  margin: 0;
  font-size: 1.1rem;
}

.products-shelf__header span {
  background-color: #e2e8f0;
  color: #0f172a;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-weight: 600;
}

.products-shelf__empty {
  margin: 0;
  color: #94a3b8;
  font-style: italic;
}

.products-shelf__card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background-color: #ffffff;
  cursor: grab;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  margin-bottom: 0.75rem;
}

.products-shelf__card:active {
  cursor: grabbing;
}

.products-shelf__card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px -20px rgba(15, 23, 42, 0.4);
}

.products-shelf__card-image {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.products-shelf__card-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.products-shelf__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.products-shelf__card-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
}

.products-shelf__card-description {
  margin: 0;
  color: #64748b;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .products-shelf {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .products-shelf__column {
    min-height: auto;
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .products-shelf__card {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }

  .products-shelf__card-content {
    width: 100%;
    align-items: center;
  }

  .products-shelf__card-header {
    flex-direction: column;
    align-items: center;
  }

  .products-shelf__card-description {
    width: 100%;
  }
}
</style>
