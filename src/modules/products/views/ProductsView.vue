<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import Card from 'primevue/card'
import ContextMenu from 'primevue/contextmenu'
import Message from 'primevue/message'
import TabPanel from 'primevue/tabpanel'
import TabView from 'primevue/tabview'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'

import ProductFormDialog from '../components/ProductFormDialog.vue'
import ProductsHeader from '../components/ProductsHeader.vue'
import ProductsShelf from '../components/ProductsShelf.vue'
import ProductsTable from '../components/ProductsTable.vue'
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

const currentUser = computed(() => authStore.currentUser)

const isSavingProduct = computed(
  () => mutations.createProduct.isPending.value || mutations.updateProduct.isPending.value,
)

const isUpdatingStatus = computed(() => mutations.updateStatus.isPending.value)
const isDeletingProduct = computed(() => mutations.deleteProduct.isPending.value)
const isProductsLoading = computed(
  () => productsQuery.isLoading.value || productsQuery.isFetching.value,
)

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
const formatCurrency = (value: number) => currencyFormatter.format(value)

const shouldAutoConfirmDelete = () => {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem('store.e2e.autoConfirmDelete') === 'true'
}

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

  const executeRemoval = async () => {
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
  }

  if (shouldAutoConfirmDelete()) {
    void executeRemoval()
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
      await executeRemoval()
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
        error instanceof Error ? error.message : 'Não foi possível alterar o status do produto.',
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

const handleShelfContextMenu = ({ event, product }: { event: MouseEvent; product: Product }) => {
  handleContextMenu(event, product)
}

const handleShelfDrop = async ({
  productId,
  status,
}: {
  productId: number
  status: ProductStatus
}) => {
  if (!isAdmin.value) {
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

const handleTableEdit = (product: Product) => {
  selectProduct(product)
  openEditDialog(product)
}

const handleTableDelete = ({ event, product }: { event: MouseEvent; product: Product }) => {
  selectProduct(product)
  handleDeleteProduct(product, event.currentTarget)
}
</script>

<template>
  <section class="products-page">
    <ProductsHeader :current-user="currentUser" @create="openCreateDialog" @logout="handleLogout" />

    <Card class="products-card">
      <template #content>
        <Message v-if="productsQuery.isError.value" severity="error" class="products-message">
          Não foi possível carregar os produtos.
        </Message>

        <TabView class="products-tabs">
          <TabPanel header="Tabela" value="table">
            <ProductsTable
              :products="products"
              :is-admin="isAdmin"
              :is-loading="isProductsLoading"
              :is-deleting-product="isDeletingProduct"
              :is-updating-status="isUpdatingStatus"
              :placeholder-image="placeholderImage"
              :format-currency="formatCurrency"
              @edit="handleTableEdit"
              @delete="handleTableDelete"
              @toggle-status="handleToggleStatus"
            />
          </TabPanel>

          <TabPanel header="Prateleira" value="shelf">
            <ProductsShelf
              :active-products="activeProducts"
              :inactive-products="inactiveProducts"
              :is-admin="isAdmin"
              :placeholder-image="placeholderImage"
              :format-currency="formatCurrency"
              @context-menu="handleShelfContextMenu"
              @drop="handleShelfDrop"
            />
          </TabPanel>
        </TabView>
      </template>
    </Card>

    <ProductFormDialog
      v-model:visible="dialogVisible"
      v-model:form="form"
      :mode="dialogMode"
      :status-options="statusOptions"
      :is-admin="isAdmin"
      :is-saving-product="isSavingProduct"
      :is-form-valid="isFormValid"
      @hide="handleDialogHide"
      @save="handleSaveProduct"
    />

    <ContextMenu ref="contextMenuRef" :model="contextMenuItems" @hide="clearSelection" />
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

@media (max-width: 768px) {
  .products-page {
    padding-inline: 1rem;
  }
}
</style>
