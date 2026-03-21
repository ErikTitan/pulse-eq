<script>
import { useAuthStore } from '@/stores/authStore'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'

export default {
  name: 'ResetPasswordView',
  components: {
    InputText,
    Button,
    Message,
  },
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      form: {
        email: '',
        password: '',
        password_confirmation: '',
        token: '',
      },
      successMessage: '',
      isLoading: false,
    }
  },
  mounted() {
    this.form.email = this.$route.query.email || ''
    this.form.token = this.$route.query.token || ''

    if (!this.form.token || !this.form.email) {
      this.authStore.error = 'Invalid or missing password reset token.'
    }
  },
  methods: {
    async handleResetPassword() {
      this.isLoading = true
      this.successMessage = ''
      this.authStore.clearError()

      const result = await this.authStore.resetPassword(this.form)

      if (result.success) {
        this.successMessage = 'Password reset successfully! Redirecting...'
        setTimeout(() => {
          this.$router.push({ path: '/', query: { login: 'true' } })
        }, 2000)
      }

      this.isLoading = false
    },
  },
}
</script>

<template>
  <main class="flex-grow flex items-center justify-center pt-24 pb-12 px-4 relative z-10 min-h-screen">
    <div class="w-full max-w-md">
      <div
        class="bg-surface-800/80 backdrop-blur-md rounded-2xl border border-surface-200 dark:border-surface-700 p-8 shadow-2xl">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p class="text-surface-600 dark:text-surface-400 mt-2">Enter your new password below.</p>
        </div>

        <Message v-if="authStore.error" severity="error" :closable="false" class="mb-6">
          {{ authStore.error }}
        </Message>

        <Message v-if="successMessage" severity="success" :closable="false" class="mb-6">
          {{ successMessage }}
        </Message>

        <form @submit.prevent="handleResetPassword" class="space-y-6">
          <div>
            <label for="email" class="block text-surface-700 dark:text-surface-200 font-medium mb-2">Email
              Address</label>
            <InputText id="email" v-model="form.email" type="email" readonly
              class="w-full !bg-surface-200/50 dark:!bg-surface-700/50 !text-surface-600 dark:!text-surface-400 cursor-not-allowed" />
          </div>

          <div>
            <label for="password" class="block text-surface-700 dark:text-surface-200 font-medium mb-2">New
              Password</label>
            <InputText id="password" v-model="form.password" type="password" required class="w-full" />
          </div>

          <div>
            <label for="password_confirmation"
              class="block text-surface-700 dark:text-surface-200 font-medium mb-2">Confirm New Password</label>
            <InputText id="password_confirmation" v-model="form.password_confirmation" type="password" required
              class="w-full" />
          </div>

          <Button type="submit" label="Reset Password" :loading="isLoading" :disabled="!form.token || !form.email"
            class="w-full !p-4" />
        </form>
      </div>
    </div>
  </main>
</template>
