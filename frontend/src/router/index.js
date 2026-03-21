import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import HomeView from '../views/HomeView.vue'
import EqualizerView from '../views/EqualizerView.vue'
import ContactView from '@/views/ContactView.vue'
import PresetsView from '@/views/PresetsView.vue'
import MyPresetsView from '@/views/MyPresetsView.vue'
import NotFound from '@/views/NotFound.vue'
import CorrectionView from '@/views/CorrectionView.vue'
import OAuthCallbackView from '@/views/OAuthCallbackView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import VerifyEmailView from '@/views/VerifyEmailView.vue'
import PresetPreviewModal from '../components/PresetPreviewModal.vue'

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
      meta: { requiresAuth: true },
    },
    {
      path: '/presets',
      name: 'presets',
      component: PresetsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/presets/:slug',
      name: 'PresetDetail',
      components: {
        default: PresetsView,
        modal: PresetPreviewModal,
      },
      props: {
        default: true,
        modal: true,
      },
      meta: { requiresAuth: false },
    },
    {
      path: '/my-presets',
      name: 'my-presets',
      component: MyPresetsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/correction',
      name: 'correction',
      component: CorrectionView,
      meta: { requiresAuth: false },
    },
    {
      path: '/oauth-callback',
      name: 'oauth-callback',
      component: OAuthCallbackView,
      meta: { requiresAuth: false },
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
      meta: { requiresAuth: false },
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: VerifyEmailView,
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
