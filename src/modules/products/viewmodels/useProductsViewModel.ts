import { computed, reactive } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { storeToRefs } from 'pinia'

import { fetchProducts } from '@/core/services'
import { useAuthStore } from '@/core/stores'
import type { Product } from '../models/product'

interface ProductsViewModelState {
  selectedProduct: Product | null
  isDialogOpen: boolean
}

const PRODUCTS_QUERY_KEY = ['products'] as const

export function useProductsViewModel() {
  const authStore = useAuthStore()
  const { role, isAuthenticated } = storeToRefs(authStore)

  const state = reactive<ProductsViewModelState>({
    selectedProduct: null,
    isDialogOpen: false,
  })

  const productsQuery = useQuery({
    queryKey: computed(() => [...PRODUCTS_QUERY_KEY, role.value ?? 'guest']),
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

  return {
    state,
    productsQuery,
    products,
    activeProducts,
    inactiveProducts,
    selectProduct,
    toggleDialog,
  }
}
