import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/core/stores'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { name: 'login' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/views/LoginView.vue'),
    meta: {
      public: true,
    },
  },
  {
    path: '/cadastro',
    name: 'register',
    component: () => import('@/modules/auth/views/RegisterView.vue'),
    meta: {
      public: true,
    },
  },
  {
    path: '/produtos',
    name: 'products',
    component: () => import('@/modules/products/views/ProductsView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const { isAuthenticated } = storeToRefs(authStore)

  if (to.meta?.public) {
    if ((to.name === 'login' || to.name === 'register') && isAuthenticated.value) {
      return { name: 'products' }
    }
    return true
  }

  if (!isAuthenticated.value) {
    return { name: 'login' }
  }

  return true
})

export default router
