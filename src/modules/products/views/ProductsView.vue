<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import ContextMenu from 'primevue/contextmenu'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputSwitch from 'primevue/inputswitch'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import TabPanel from 'primevue/tabpanel'
import TabView from 'primevue/tabview'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

import { useProductsViewModel } from '../viewmodels/useProductsViewModel'
import type { Product, ProductPayload, ProductStatus } from '../models/product'

import { useAuthStore } from '@/core/stores'

type DialogMode = 'create' | 'edit'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()

const {
  state,
  productsQuery,
  products,
  activeProducts,
  inactiveProducts,
  isAdmin,
  selectProduct,
  clearSelection,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  mutations,
} = useProductsViewModel()

const dialogVisible = ref(false)
const dialogMode = ref<DialogMode>('create')

const defaultForm = (): ProductPayload & { id?: number } => ({
  name: '',
  description: '',
  price: 0,
  image: '',
  status: 'activated',
})

const form = reactive<ProductPayload & { id?: number }>(defaultForm())

const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)
const dragOverStatus = ref<ProductStatus | null>(null)

const currentUser = computed(() => authStore.currentUser)

const isSavingProduct = computed(
  () => mutations.createProduct.isPending.value || mutations.updateProduct.isPending.value,
)

const isUpdatingStatus = computed(() => mutations.updateStatus.isPending.value)
const isDeletingProduct = computed(() => mutations.deleteProduct.isPending.value)

const isFormValid = computed(() => form.name.trim() !== '' && Number(form.price) > 0)

const statusOptions = [
  { label: 'Ativo', value: 'activated' },
  { label: 'Inativo', value: 'disabled' },
]

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const placeholderImage = 'https://via.placeholder.com/120x120.png?text=Produto'

const resetForm = () => {
  Object.assign(form, defaultForm())
  delete form.id
}

const openCreateDialog = () => {
  dialogMode.value = 'create'
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (product: Product) => {
  dialogMode.value = 'edit'
  Object.assign(form, { ...product })
  dialogVisible.value = true
}

const handleDialogHide = () => {
  clearSelection()
  resetForm()
}

const handleSaveProduct = async () => {
  if (!isFormValid.value) {
    return
  }

  const payload: ProductPayload = {
    name: form.name.trim(),
    description: form.description.trim(),
    image: form.image.trim(),
    price: Number(form.price),
    status: form.status,
  }

  try {
    if (dialogMode.value === 'create') {
      await createProduct(payload)
      toast.add({
        severity: 'success',
        summary: 'Produto criado',
        detail: `${payload.name} cadastrado com sucesso.`,
        life: 3000,
      })
    } else if (form.id != null) {
      await updateProduct(form.id, payload)
      toast.add({
        severity: 'success',
        summary: 'Produto atualizado',
        detail: `${payload.name} atualizado com sucesso.`,
        life: 3000,
      })
    }
    dialogVisible.value = false
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro ao salvar',
      detail: error instanceof Error ? error.message : 'Não foi possível salvar o produto.',
      life: 4000,
    })
  }
}

const handleDeleteProduct = (product: Product, target?: EventTarget | null) => {
  if (!isAdmin.value) {
    return
  }

  confirm.require({
    message: `Deseja realmente excluir "${product.name}"?`,
    header: 'Remover produto',
    icon: 'pi pi-exclamation-triangle',
    target: target instanceof HTMLElement ? target : undefined,
    acceptClass: 'p-button-danger',
    acceptLabel: 'Excluir',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        await deleteProduct(product.id)
        toast.add({
          severity: 'success',
          summary: 'Produto removido',
          detail: `${product.name} foi excluído.`,
          life: 3000,
        })
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Erro ao remover',
          detail:
            error instanceof Error
              ? error.message
              : 'Não foi possível remover o produto. Tente novamente.',
          life: 4000,
        })
      }
    },
  })
}

const handleToggleStatus = async (product: Product) => {
  if (!isAdmin.value || isUpdatingStatus.value) {
    return
  }

  const targetStatus: ProductStatus = product.status === 'activated' ? 'disabled' : 'activated'

  try {
    await updateProductStatus(product.id, targetStatus)
    toast.add({
      severity: 'success',
      summary: 'Status atualizado',
      detail: `${product.name} agora está ${targetStatus === 'activated' ? 'ativo' : 'inativo'}.`,
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro ao atualizar',
      detail:
        error instanceof Error
          ? error.message
          : 'Não foi possível alterar o status do produto.',
      life: 4000,
    })
  }
}

const handleContextMenu = (event: MouseEvent, product: Product) => {
  selectProduct(product)
  contextMenuRef.value?.show(event)
}

const contextMenuItems = computed(() => {
  const items = [
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => {
        if (state.selectedProduct) {
          openEditDialog(state.selectedProduct)
        }
      },
    },
  ]

  if (isAdmin.value) {
    items.push({
      label: 'Excluir',
      icon: 'pi pi-trash',
      command: () => {
        if (state.selectedProduct) {
          handleDeleteProduct(state.selectedProduct)
        }
      },
    })
  }

  return items
})

const handleDragStart = (event: DragEvent, product: Product) => {
  if (!isAdmin.value) {
    return
  }
  event.dataTransfer?.setData('text/plain', String(product.id))
}

const handleDragEnter = (status: ProductStatus) => {
  if (!isAdmin.value) {
    return
  }
  dragOverStatus.value = status
}

const handleDragLeave = () => {
  dragOverStatus.value = null
}

const handleDrop = async (event: DragEvent, status: ProductStatus) => {
  if (!isAdmin.value) {
    return
  }

  dragOverStatus.value = null

  const productId = Number(event.dataTransfer?.getData('text/plain'))
  if (!productId) {
    return
  }

  const product = products.value.find((item) => item.id === productId)
  if (!product || product.status === status) {
    return
  }

  try {
    await updateProductStatus(product.id, status)
    toast.add({
      severity: 'success',
      summary: 'Status atualizado',
      detail: `${product.name} movido para ${
        status === 'activated' ? 'Produtos ativos' : 'Produtos inativos'
      }.`,
      life: 3000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Erro ao mover produto',
      detail:
        error instanceof Error
          ? error.message
          : 'Não foi possível mover o produto para a nova prateleira.',
      life: 4000,
    })
  }
}

const handleLogout = () => {
  authStore.clear()
  toast.add({
    severity: 'info',
    summary: 'Sessão encerrada',
    life: 2500,
  })
  router.push({ name: 'login' })
}

const statusSeverity = (status: ProductStatus) => (status === 'activated' ? 'success' : 'secondary')

const statusLabel = (status: ProductStatus) => (status === 'activated' ? 'Ativo' : 'Inativo')

const handleRowEdit = (product: Product) => {
  selectProduct(product)
  openEditDialog(product)
}

const handleRowDelete = (event: MouseEvent, product: Product) => {
  selectProduct(product)
  handleDeleteProduct(product, event.currentTarget)
}
</script>

<template>
  <section class="products-page">
    <header class="products-header">
      <div class="products-header__info">
        <h1>Produtos</h1>
        <p v-if="currentUser" class="products-header__subtitle">
          Logado como
          <strong>{{ currentUser.email }}</strong>
          ({{ currentUser.role }})
        </p>
      </div>

      <div class="products-header__actions">
        <Button
          label="Novo Produto"
          icon="pi pi-plus"
          class="products-header__button"
          @click="openCreateDialog"
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

    <Card class="products-card">
      <template #content>
        <Message v-if="productsQuery.isError.value" severity="error" class="products-message">
          Não foi possível carregar os produtos.
        </Message>

        <TabView class="products-tabs">
          <TabPanel header="Tabela" value="table">
            <DataTable
              :value="products"
              dataKey="id"
              :loading="productsQuery.isLoading.value || productsQuery.isFetching.value"
              stripedRows
              responsiveLayout="stack"
              breakpoint="960px"
              :emptyMessage="isAdmin ? 'Nenhum produto cadastrado.' : 'Nenhum produto disponível.'"
            >
              <Column header="Imagem" style="width: 8rem">
                <template #body="{ data }">
                  <img
                    :src="data.image || placeholderImage"
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
                  {{ currencyFormatter.format(data.price) }}
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
                    <Button
                      icon="pi pi-pencil"
                      rounded
                      text
                      severity="info"
                      @click="handleRowEdit(data)"
                    />
                    <Button
                      v-if="isAdmin"
                      icon="pi pi-trash"
                      rounded
                      text
                      severity="danger"
                      :disabled="isDeletingProduct"
                      @click="(event) => handleRowDelete(event, data)"
                    />
                    <InputSwitch
                      v-if="isAdmin"
                      :modelValue="data.status === 'activated'"
                      :disabled="isUpdatingStatus"
                      @update:modelValue="() => handleToggleStatus(data)"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
          </TabPanel>

          <TabPanel header="Prateleira" value="shelf">
            <div class="products-shelf">
              <section
                class="products-shelf__column"
                :class="{
                  'products-shelf__column--droppable': dragOverStatus === 'activated',
                  'products-shelf__column--disabled': !isAdmin,
                }"
                @dragenter.prevent="handleDragEnter('activated')"
                @dragover.prevent
                @dragleave="handleDragLeave"
                @drop.prevent="(event) => handleDrop(event, 'activated')"
              >
                <header class="products-shelf__header">
                  <h2>Produtos ativos</h2>
                  <span>{{ activeProducts.length }}</span>
                </header>

                <p v-if="activeProducts.length === 0" class="products-shelf__empty">
                  Nenhum produto ativo.
                </p>

                <article
                  v-for="product in activeProducts"
                  :key="product.id"
                  class="products-shelf__card"
                  :draggable="isAdmin"
                  @dragstart="(event) => handleDragStart(event, product)"
                  @contextmenu.prevent="(event) => handleContextMenu(event, product)"
                >
                  <img
                    :src="product.image || placeholderImage"
                    :alt="product.name"
                    class="products-shelf__card-image"
                  />
                  <div class="products-shelf__card-content">
                    <div class="products-shelf__card-header">
                      <h3>{{ product.name }}</h3>
                      <Tag :value="currencyFormatter.format(product.price)" severity="success" />
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
                  'products-shelf__column--disabled': !isAdmin,
                }"
                @dragenter.prevent="handleDragEnter('disabled')"
                @dragover.prevent
                @dragleave="handleDragLeave"
                @drop.prevent="(event) => handleDrop(event, 'disabled')"
              >
                <header class="products-shelf__header">
                  <h2>Produtos inativos</h2>
                  <span>{{ inactiveProducts.length }}</span>
                </header>

                <p v-if="inactiveProducts.length === 0" class="products-shelf__empty">
                  Nenhum produto inativo.
                </p>

                <article
                  v-for="product in inactiveProducts"
                  :key="product.id"
                  class="products-shelf__card"
                  :draggable="isAdmin"
                  @dragstart="(event) => handleDragStart(event, product)"
                  @contextmenu.prevent="(event) => handleContextMenu(event, product)"
                >
                  <img
                    :src="product.image || placeholderImage"
                    :alt="product.name"
                    class="products-shelf__card-image"
                  />
                  <div class="products-shelf__card-content">
                    <div class="products-shelf__card-header">
                      <h3>{{ product.name }}</h3>
                      <Tag :value="currencyFormatter.format(product.price)" severity="secondary" />
                    </div>
                    <p class="products-shelf__card-description">
                      {{ product.description || 'Sem descrição.' }}
                    </p>
                  </div>
                </article>
              </section>
            </div>
          </TabPanel>
        </TabView>
      </template>
    </Card>

    <Dialog
      v-model:visible="dialogVisible"
      :modal="true"
      :header="dialogMode === 'create' ? 'Novo produto' : 'Editar produto'"
      class="products-dialog"
      @hide="handleDialogHide"
    >
      <form class="products-form" @submit.prevent="handleSaveProduct">
        <div class="products-form__field">
          <label for="product-name">Nome</label>
          <InputText id="product-name" v-model="form.name" required autofocus />
        </div>

        <div class="products-form__field">
          <label for="product-price">Preço</label>
          <InputNumber
            id="product-price"
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

        <div class="products-form__field" v-if="isAdmin">
          <label for="product-status">Status</label>
          <Dropdown
            id="product-status"
            v-model="form.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
          />
        </div>

        <div class="products-form__actions">
          <Button
            type="button"
            label="Cancelar"
            outlined
            severity="secondary"
            @click="dialogVisible = false"
          />
          <Button
            type="submit"
            label="Salvar"
            icon="pi pi-check"
            :loading="isSavingProduct"
            :disabled="!isFormValid || isSavingProduct"
          />
        </div>
      </form>
    </Dialog>

    <ContextMenu
      ref="contextMenuRef"
      :model="contextMenuItems"
      @hide="clearSelection"
    />
  </section>
</template>

<style scoped>
.products-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem clamp(1rem, 5vw, 3rem);
  background-color: #f3f4f6;
  min-height: 100vh;
}

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

.products-card {
  border-radius: 1.5rem;
  box-shadow: 0 25px 45px -20px rgba(15, 23, 42, 0.25);
  border: 1px solid rgba(148, 163, 184, 0.25);
}

.products-message {
  margin-bottom: 1rem;
}

.products-tabs {
  margin-top: 0.5rem;
}

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
  transition: border-color 0.2s ease, background-color 0.2s ease;
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
  transition: transform 0.15s ease, box-shadow 0.15s ease;
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

  .products-page {
    padding-inline: 1rem;
  }
}
</style>
