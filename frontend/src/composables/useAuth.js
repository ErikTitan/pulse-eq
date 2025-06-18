import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter, useRoute } from 'vue-router'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  // Computed properties
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)
  const isLoading = computed(() => authStore.isLoading)
  const error = computed(() => authStore.error)

  // Methods
  const login = async (credentials) => {
    return await authStore.login(credentials)
  }

  const register = async (userData) => {
    return await authStore.register(userData)
  }

  const logout = async () => {
    await authStore.logout()
    // Redirect to home after logout
    if (route.meta.requiresAuth) {
      router.push({ name: 'home' })
    }
  }

  // Check if user can access a specific route
  const canAccess = (routeName) => {
    const targetRoute = router.resolve({ name: routeName })
    if (targetRoute.meta.requiresAuth && !authStore.isAuthenticated) {
      return false
    }
    return true
  }

  // Navigate to route with auth check
  const navigateWithAuth = (routeName, params = {}) => {
    if (!canAccess(routeName)) {
      router.push({
        name: 'home',
        query: {
          redirect: router.resolve({ name: routeName, params }).href,
          showLogin: 'true',
        },
      })
      return false
    }
    router.push({ name: routeName, params })
    return true
  }

  return {
    // State
    isAuthenticated,
    user,
    isLoading,
    error,

    // Actions
    login,
    register,
    logout,

    // Utilities
    canAccess,
    navigateWithAuth,
  }
}
