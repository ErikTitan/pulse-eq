<script>
import Button from 'primevue/button';

export default {
  name: 'NotFound',
  components: {
    Button
  },
  data() {
    return {
      waves: [24, 32, 16, 48, 24, 36, 24, 32, 16, 24]
    }
  },
  methods: {
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen px-4">
    <div class="text-center">
      <div class="mb-8">
        <i class="pi pi-exclamation-circle text-8xl text-primary"></i>
      </div>
      <h1 class="text-6xl font-bold mb-4 text-gray-900">404</h1>
      <h2 class="text-2xl font-semibold mb-6 text-gray-600">Page Not Found</h2>
      <p class="text-lg mb-8 text-gray-600 max-w-lg">
        Oops! It seems you've wandered into uncharted territory. The audio preset you're looking for might be on a
        different frequency.
      </p>
      <Button label="Return Home" icon="pi pi-home" severity="primary" class="p-button-rounded p-button-lg"
        @click="goHome" />
    </div>
    <div class="mt-16 flex gap-4">
      <div v-for="(wave, index) in waves" :key="index" class="w-2 bg-primary rounded-full animate-pulse" :style="{
        height: `${wave}px`,
        animationDelay: `${index * 0.1}s`
      }"></div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {

  0%,
  100% {
    transform: scaleY(1);
  }

  50% {
    transform: scaleY(0.7);
  }
}

.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>