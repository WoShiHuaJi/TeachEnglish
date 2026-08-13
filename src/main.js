import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initSync } from './composables/useSync'
import './assets/main.css'

createApp(App).use(router).mount('#app')

initSync()

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
