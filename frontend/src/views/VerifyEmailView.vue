<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/axios'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'

const route = useRoute()
const router = useRouter()

const verificationStatus = ref('loading') // loading, success, error
const message = ref('')

onMounted(async () => {
  const verifyUrl = route.query.verify_url

  if (!verifyUrl) {
    verificationStatus.value = 'error'
    message.value = 'Invalid or missing verification link.'
    return
  }

  try {
    const response = await apiClient.get(verifyUrl)
    verificationStatus.value = 'success'
    message.value = response.data.message || 'Email verified successfully.'

    // Redirect to login after a few seconds
    setTimeout(() => {
      router.push({ path: '/', query: { login: 'true' } })
    }, 3000)
  } catch (error) {
    verificationStatus.value = 'error'
    if (error.response?.status === 403) {
      message.value = 'Invalid or expired verification link.'
    } else {
      message.value = error.response?.data?.message || 'Failed to verify email.'
    }
  }
})
</script>

<template>
  <main class="flex-grow flex items-center justify-center pt-24 pb-12 px-4 relative z-10 min-h-screen">
    <div class="w-full max-w-md">
      <div
        class="bg-surface-800/80 backdrop-blur-md rounded-2xl border border-surface-200 dark:border-surface-700 p-8 shadow-2xl flex flex-col items-center text-center">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Email Verification
          </h1>
        </div>

        <div v-if="verificationStatus === 'loading'" class="flex flex-col items-center gap-4 my-8">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="transparent"
            animationDuration=".5s" />
          <p class="text-surface-600 dark:text-surface-400">Verifying your email...</p>
        </div>

        <Message v-if="verificationStatus === 'error'" severity="error" :closable="false" class="mb-6 w-full">
          {{ message }}
        </Message>

        <Message v-if="verificationStatus === 'success'" severity="success" :closable="false" class="mb-6 w-full">
          {{ message }} Redirecting to login...
        </Message>

        <Button v-if="verificationStatus !== 'loading'" label="Go to Login"
          @click="router.push({ path: '/', query: { login: 'true' } })" class="w-full mt-4 !p-4" />
      </div>
    </div>
  </main>
</template>
