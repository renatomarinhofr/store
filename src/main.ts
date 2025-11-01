import { createApp } from 'vue'

import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'

import { vueQueryPlugin } from '@/core/providers'
import { pinia } from '@/core/stores'
import StorePreset from '@/themes/storePreset'
import App from './App.vue'
import router from './router'

import 'primeicons/primeicons.css'
import '@/assets/styles/main.css'

const app = createApp(App)

app.use(pinia)
app.use(vueQueryPlugin)
app.use(PrimeVue, {
  theme: {
    preset: StorePreset,
    options: {
      darkModeSelector: '.dark-mode',
    },
  },
})
app.use(ToastService)
app.use(router)

app.mount('#app')
