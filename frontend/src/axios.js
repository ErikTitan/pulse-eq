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
  console.log('Request:', config.url)

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
    await sanctumClient.get('sanctum/csrf-cookie')
  }

  return config
})

export default apiClient
