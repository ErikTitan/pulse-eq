import { defineStore } from 'pinia'
import apiClient from '../axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }),

  getters: {
    userName: (state) => state.user?.name || '',
    userEmail: (state) => state.user?.email || '',
    avatarLabel: (state) => {
      if (state.user?.name) {
        return state.user.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
      }
      return 'U'
    },
  },

  actions: {
    // Initialize auth state on app load
    async checkAuthOnMount() {
      console.log('Checking auth status on mount...')
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get('/api/user')
        if (response.data) {
          this.user = response.data
          this.isAuthenticated = true
          console.log('User is authenticated:', this.user)
        }
      } catch (error) {
        if (error.response?.status !== 401 && error.response?.status !== 419) {
          console.error('Error checking auth status:', error.response?.data || error.message)
          this.error = 'Failed to check authentication status'
        } else {
          console.log('User is not authenticated.')
          this.clearAuth()
        }
      } finally {
        this.isLoading = false
      }
    },

    // Login user
    async login(credentials) {
      this.isLoading = true
      this.error = null

      try {
        // 1. Ensure CSRF cookie is set
        await apiClient.get('/sanctum/csrf-cookie')

        // 2. Attempt login
        const response = await apiClient.post('/api/login', credentials)
        console.log('Login response:', response)

        // 3. Fetch user data after successful login
        const userResponse = await apiClient.get('/api/user')
        console.log('User data:', userResponse.data)

        this.user = userResponse.data
        this.isAuthenticated = true

        return { success: true, user: userResponse.data }
      } catch (error) {
        console.error('Login failed:', error.response?.data || error.message)

        let errorMessage = 'Login failed. Please try again.'

        if (error.response?.status === 422) {
          errorMessage = Object.values(error.response.data.errors).flat().join(' ')
        } else if (error.response?.status === 401) {
          errorMessage = error.response.data.message || 'Invalid credentials.'
        }

        this.error = errorMessage
        return { success: false, error: errorMessage }
      } finally {
        this.isLoading = false
      }
    },

    // Register new user
    async register(userData) {
      this.isLoading = true
      this.error = null

      try {
        // 1. Ensure CSRF cookie is set
        await apiClient.get('/sanctum/csrf-cookie')

        // 2. Attempt registration
        const response = await apiClient.post('/api/register', userData)
        console.log('Register response:', response.data)

        // 3. Automatically log in the user after registration
        const loginResult = await this.loginAfterRegister(userData.email, userData.password)

        if (loginResult.success) {
          return { success: true, user: loginResult.user }
        } else {
          this.error = 'Registration successful, but auto-login failed. Please log in manually.'
          return { success: false, error: this.error }
        }
      } catch (error) {
        console.error('Registration failed:', error.response?.data || error.message)

        let errorMessage = 'Registration failed. Please try again.'

        if (error.response?.status === 422) {
          errorMessage = Object.values(error.response.data.errors).flat().join(' ')
        }

        this.error = errorMessage
        return { success: false, error: errorMessage }
      } finally {
        this.isLoading = false
      }
    },

    // Helper method for auto-login after registration
    async loginAfterRegister(email, password) {
      console.log('Attempting login after registration...')
      try {
        await apiClient.post('/api/login', { email, password })
        const userResponse = await apiClient.get('/api/user')

        this.user = userResponse.data
        this.isAuthenticated = true

        return { success: true, user: userResponse.data }
      } catch (error) {
        console.error(
          'Auto-login after registration failed:',
          error.response?.data || error.message,
        )
        return { success: false, error: 'Auto-login failed' }
      }
    },

    // Logout user
    async logout() {
      console.log('Attempting logout')
      this.isLoading = true

      try {
        await apiClient.post('/api/logout')
        console.log('Logout successful')
      } catch (error) {
        console.error('Logout failed:', error.response?.data || error.message)
        // Even if logout fails on server, clear local state
      } finally {
        this.clearAuth()
        this.isLoading = false
      }
    },

    // Clear authentication state
    clearAuth() {
      this.user = null
      this.isAuthenticated = false
      this.error = null
    },

    // Clear any error messages
    clearError() {
      this.error = null
    },
  },

  // Persist auth state to localStorage
  persist: {
    key: 'auth',
    storage: localStorage,
    paths: ['user', 'isAuthenticated'],
  },
})
