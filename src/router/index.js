import { createRouter, createWebHashHistory } from 'vue-router'
import { usePhonetics } from '../composables/usePhonetics'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/Home.vue') },
  { path: '/phonetics', name: 'phonetics', component: () => import('../views/Phonetics.vue') },
  { path: '/grammar', name: 'grammar', component: () => import('../views/Grammar.vue') },
  { path: '/grammar/:id', name: 'grammar-detail', component: () => import('../views/GrammarDetail.vue') },
  { path: '/vocabulary', name: 'vocabulary', component: () => import('../views/Vocabulary.vue') },
  { path: '/learn/:bookId/:unitId', name: 'learn', component: () => import('../views/Learn.vue') },
  { path: '/review', name: 'review', component: () => import('../views/Review.vue') },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.name === 'vocabulary' || to.name === 'learn') {
    const { phoneticsMastered } = usePhonetics()
    if (!phoneticsMastered.value) {
      return { name: 'phonetics' }
    }
  }
  return true
})

export default router
