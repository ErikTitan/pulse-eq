<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div v-if="isProcessing" class="space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <h2 class="text-xl font-semibold text-gray-900">Processing authentication...</h2>
          <p class="text-gray-600">Please wait while we complete your login.</p>
        </div>

        <div v-else-if="error" class="space-y-4">
          <div class="text-red-500">
            <svg class="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z">
              </path>
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900">Authentication Failed</h2>
          <p class="text-gray-600">{{ error }}</p>
          <button @click="goHome"
            class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            Go to Home
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'

export default {
  name: 'OAuthCallbackView',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    return {
      authStore,
      router
    }
  },
  data() {
    return {
      isProcessing: true,
      error: null
    }
  },
  async mounted() {
    await this.handleCallback()
  },
  methods: {
    async handleCallback() {
      this.isProcessing = true
      this.error = null

      // 1. Get URL parameters
      const urlParams = new URLSearchParams(window.location.search)
      const params = Object.fromEntries(urlParams)

      // 2. Let the store handle the initial status check from the URL
      const initialResult = this.authStore.handleOAuthCallback(params)

      if (!initialResult.success) {
        this.error = initialResult.error || 'Authentication failed due to an unknown issue.'
        this.isProcessing = false
        return
      }

      // 3. If the initial check is ok, fetch the user to confirm the session is valid
      try {
        const userResponse = await this.authStore.fetchUser()
        if (userResponse.success) {
          // On success, redirect to the home page
          this.$router.push('/')
        } else {
          // If fetching user fails, it's an error
          this.error = userResponse.error || 'Could not verify your session. Please try logging in again.'
          this.isProcessing = false
        }
      } catch (e) {
        console.error('Error during fetchUser in callback:', e)
        this.error = 'An unexpected error occurred while verifying your session.'
        this.isProcessing = false
      }
    },
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>
