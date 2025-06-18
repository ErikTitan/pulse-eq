<template>
  <div class="flex items-center justify-center min-h-[60vh] px-4">
    <div class="max-w-md w-full">
      <Card class="text-center">
        <template #content>
          <div class="py-8">
            <!-- Icon -->
            <div class="mb-6">
              <i class="pi pi-lock text-6xl text-primary-400 opacity-80"></i>
            </div>

            <!-- Title -->
            <h2 class="text-2xl font-bold text-surface-500 mb-4">
              Authentication Required
            </h2>

            <!-- Description -->
            <p class="text-surface-600 mb-8 leading-relaxed">
              This feature requires you to be signed in. Please log in to your account or create a new one to continue.
            </p>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <Button label="Sign In" icon="pi pi-sign-in" @click="$emit('showLogin')" class="px-6 py-3" />
              <Button label="Create Account" icon="pi pi-user-plus" variant="outlined" @click="$emit('showRegister')"
                class="px-6 py-3" />
            </div>

            <!-- Additional Help -->
            <div class="mt-8 pt-6 border-t border-surface-200 dark:border-surface-700">
              <p class="text-sm text-surface-500 dark:text-surface-400">
                <i class="pi pi-info-circle mr-2"></i>
                Your data will be securely saved and synced across devices
              </p>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script>
import Card from 'primevue/card'
import Button from 'primevue/button'

export default {
  name: 'AuthRequired',
  components: {
    Card,
    Button
  },
  emits: ['showLogin', 'showRegister']
}
</script>

<style scoped>
/* Add subtle animation */
.pi-lock {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.8;
  }

  50% {
    opacity: 0.4;
  }
}
</style>
