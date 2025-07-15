import axios from 'axios'

// Use relative URLs - nginx will handle routing
const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for CSRF token
apiClient.interceptors.request.use(async (config) => {
  // Get CSRF token for state-changing requests
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    // Use axios.create() without baseURL for Sanctum endpoints
    const sanctumClient = axios.create({
      withCredentials: true,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    await sanctumClient.get('/sanctum/csrf-cookie')
  }

  return config
})

// Add response interceptor for handling 401/419 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && [401, 419].includes(error.response.status)) {
      // Dynamically import the store here to avoid circular dependencies
      const { useAuthStore } = await import('./stores/authStore')
      const authStore = useAuthStore()
      if (authStore.isAuthenticated) {
        authStore.logout()
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
