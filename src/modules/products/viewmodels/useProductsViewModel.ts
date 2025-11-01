import { computed, reactive } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'

import {
  createProduct as createProductRequest,
  deleteProduct as deleteProductRequest,
  fetchProducts,
  updateProduct as updateProductRequest,
  updateProductStatus as updateProductStatusRequest,
} from '@/core/services'
import { useAuthStore } from '@/core/stores'
import type { Product, ProductPayload, ProductStatus } from '../models/product'

interface ProductsViewModelState {
  selectedProduct: Product | null
  isDialogOpen: boolean
}

const PRODUCTS_QUERY_KEY = ['products'] as const

export function useProductsViewModel() {
  const authStore = useAuthStore()
  const { role, isAuthenticated } = storeToRefs(authStore)
  const queryClient = useQueryClient()

  const state = reactive<ProductsViewModelState>({
    selectedProduct: null,
    isDialogOpen: false,
  })

  const isAdmin = computed(() => role.value === 'admin')
  const queryKey = computed(() => [...PRODUCTS_QUERY_KEY, role.value ?? 'guest'] as const)

  const productsQuery = useQuery({
    queryKey,
    queryFn: fetchProducts,
    enabled: isAuthenticated,
  })

  const products = computed(() => productsQuery.data.value ?? [])
  const activeProducts = computed(() =>
    products.value.filter((product) => product.status === 'activated'),
  )
  const inactiveProducts = computed(() =>
    products.value.filter((product) => product.status === 'disabled'),
  )

  const selectProduct = (product: Product | null) => {
    state.selectedProduct = product
  }

  const toggleDialog = (open: boolean) => {
    state.isDialogOpen = open
  }

  const invalidateProducts = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKey.value })
  }

  const createProductMutation = useMutation({
    mutationFn: (payload: ProductPayload) => createProductRequest(payload),
    onSuccess: invalidateProducts,
  })

  const updateProductMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductPayload }) =>
      updateProductRequest(id, payload),
    onSuccess: invalidateProducts,
  })

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => deleteProductRequest(id),
    onSuccess: invalidateProducts,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ProductStatus }) =>
      updateProductStatusRequest(id, status),
    onSuccess: invalidateProducts,
  })

  const createProduct = (payload: ProductPayload) => createProductMutation.mutateAsync(payload)

  const updateProduct = (id: number, payload: ProductPayload) =>
    updateProductMutation.mutateAsync({ id, payload })

  const deleteProduct = (id: number) => deleteProductMutation.mutateAsync(id)

  const updateProductStatus = (id: number, status: ProductStatus) =>
    updateStatusMutation.mutateAsync({ id, status })

  const clearSelection = () => {
    state.selectedProduct = null
  }

  return {
    state,
    productsQuery,
    products,
    activeProducts,
    inactiveProducts,
    isAdmin,
    selectProduct,
    clearSelection,
    toggleDialog,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    mutations: {
      createProduct: createProductMutation,
      updateProduct: updateProductMutation,
      deleteProduct: deleteProductMutation,
      updateStatus: updateStatusMutation,
    },
  }
}
