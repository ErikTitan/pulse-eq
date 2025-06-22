import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import HomeView from '../views/HomeView.vue'
import EqualizerView from '../views/EqualizerView.vue'
import ContactView from '@/views/ContactView.vue'
import PresetsView from '@/views/PresetsView.vue'
import NotFound from '@/views/NotFound.vue'
import Features from '@/views/Features.vue'
import OAuthCallbackView from '@/views/OAuthCallbackView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false },
    },
    {
      path: '/equalizer',
      name: 'equalizer',
      component: EqualizerView,
      meta: { requiresAuth: false },
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView,
      meta: { requiresAuth: false },
    },
    {
      path: '/presets',
      name: 'presets',
      component: PresetsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/features',
      name: 'features',
      component: Features,
      meta: { requiresAuth: false },
    },
    {
      path: '/oauth-callback',
      name: 'oauth-callback',
      component: OAuthCallbackView,
      meta: { requiresAuth: false },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: NotFound,
      meta: { requiresAuth: false },
    },
  ],
})

export default router
