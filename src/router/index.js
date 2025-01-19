import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EqualizerView from '../views/EqualizerView.vue'
import ContactView from '@/views/ContactView.vue'
import PresetsView from '@/views/PresetsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/equalizer',
      name: 'equalizer',
      component: EqualizerView,
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView,
    },
    {
      path: '/presets',
      name: 'presets',
      component: PresetsView,
    },
  ],
})

export default router
