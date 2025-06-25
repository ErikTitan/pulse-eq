import { defineStore } from 'pinia'
import axios from 'axios'
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
    // Validates the session on app startup to ensure the UI reflects the true auth state.
    async validateSessionOnStartup() {
      // Only validate if isAuthenticated is true (from localStorage) but we don't have user data yet.
      if (!this.isAuthenticated) {
        return
      }

      console.log('Validating session on startup...')
      this.isLoading = true
      this.error = null

      try {
        const response = await apiClient.get('/user')
        if (response.data) {
          this.user = response.data
          this.isAuthenticated = true
          console.log('User session is valid:', this.user)
        }
      } catch (error) {
        if (error.response?.status !== 401 && error.response?.status !== 419) {
          console.error('Error validating session:', error.response?.data || error.message)
          this.error = 'Failed to validate session status'
        } else {
          console.log('User session is not valid or has expired.')
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
        await axios.create({ withCredentials: true }).get('/sanctum/csrf-cookie')

        // 2. Attempt login
        const response = await apiClient.post('/login', credentials)
        console.log('Login response:', response)

        // 3. Fetch user data using the dedicated action
        return await this.fetchUser()
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
        await axios.create({ withCredentials: true }).get('/sanctum/csrf-cookie')

        // 2. Attempt registration
        const response = await apiClient.post('/register', userData)
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
        await apiClient.post('/login', { email, password })
        return await this.fetchUser()
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
        await apiClient.post('/logout')
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

    // Fetch the authenticated user
    async fetchUser() {
      this.isLoading = true
      try {
        const response = await apiClient.get('/user')
        if (response.data) {
          this.user = response.data
          this.isAuthenticated = true
          console.log('User data fetched successfully:', this.user)
          return { success: true, user: this.user }
        }
        return { success: false, error: 'No user data returned.' }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        this.clearAuth()
        return { success: false, error: 'Failed to fetch user data.' }
      } finally {
        this.isLoading = false
      }
    },

    // Google OAuth login
    async loginWithGoogle() {
      this.isLoading = true
      this.error = null

      try {
        // Redirect to backend OAuth endpoint - use relative URL since nginx handles routing
        window.location.href = `/api/auth/google`
      } catch (error) {
        console.error('Google OAuth initiation failed:', error)
        this.error = 'Failed to initiate Google login'
        this.isLoading = false
      }
    },

    // Handle OAuth callback (called from OAuth callback page)
    handleOAuthCallback(params) {
      if (params.oauth_status === 'success') {
        // The session is now set on the backend.
        // The frontend should now make a request to get the user data.
        this.error = null
        return { success: true }
      } else {
        const errorMessage = params.message || 'OAuth authentication failed'
        this.error = errorMessage
        return { success: false, error: errorMessage }
      }
    },
  },

  // Persist auth state to localStorage
  persist: {
    key: 'auth',
    storage: localStorage,
    paths: ['user', 'isAuthenticated'],
  },
})
