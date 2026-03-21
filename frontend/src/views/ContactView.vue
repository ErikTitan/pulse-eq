<script>
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import apiClient from '@/axios'
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'ContactPage',
  components: {
    InputText,
    Textarea,
    Button,
    Card,
    Message,
  },
  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },
  data() {
    return {
      form: {
        name: '',
        email: '',
        subject: '',
        message: '',
        presetId: '',
        deviceType: '',
      },
      isLoading: false,
      successMessage: '',
      errorMessage: '',
    }
  },
  mounted() {
    if (this.authStore.isAuthenticated) {
      this.form.name = this.authStore.userName
      this.form.email = this.authStore.userEmail
    }
  },
  methods: {
    async submitForm() {
      this.isLoading = true
      this.successMessage = ''
      this.errorMessage = ''

      try {
        const response = await apiClient.post('/contact', this.form)
        this.successMessage = response.data.message || 'Your message has been sent successfully!'
        this.resetForm()
      } catch (error) {
        if (error.response?.status === 422) {
          this.errorMessage = Object.values(error.response.data.errors).flat().join(' ')
        } else {
          this.errorMessage =
            'An error occurred while sending your message. Please try again later.'
        }
      } finally {
        this.isLoading = false
      }
    },
    resetForm() {
      this.form = {
        name: '',
        email: '',
        subject: '',
        message: '',
        presetId: '',
        deviceType: '',
      }
    },
  },
}
</script>

<template>
  <div class="min-h-screen transition-colors duration-300 flex-1 pt-24 px-6 lg:px-20 pb-12">
    <div class="container mx-auto px-4 max-w-3xl flex flex-col gap-8">
      <!-- Contact Form Card -->
      <Card
        class="bg-glass backdrop-blur-lg shadow-xl"
        :class="isDarkMode ? 'border-white/10' : 'border-gray-200'"
      >
        <template #title>
          <h2
            class="text-3xl font-bold mb-2 text-center"
            :class="isDarkMode ? 'text-white' : 'text-gray-900'"
          >
            Contact Support
          </h2>
          <p
            class="text-center text-sm font-normal"
            :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'"
          >
            Have a question or found an issue? Send us a message and we'll get back to you.
          </p>
        </template>
        <template #content>
          <Message
            v-if="successMessage"
            severity="success"
            :closable="true"
            @close="successMessage = ''"
            class="mb-6"
          >
            {{ successMessage }}
          </Message>
          <Message
            v-if="errorMessage"
            severity="error"
            :closable="true"
            @close="errorMessage = ''"
            class="mb-6"
          >
            {{ errorMessage }}
          </Message>

          <form @submit.prevent="submitForm" class="space-y-6 mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Name</label>
                <InputText
                  v-model="form.name"
                  required
                  readonly
                  class="w-full !bg-surface-200/20 dark:!bg-white/5 cursor-not-allowed"
                />
              </div>
              <div class="space-y-2">
                <label :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Email</label>
                <InputText
                  v-model="form.email"
                  type="email"
                  required
                  readonly
                  class="w-full !bg-surface-200/20 dark:!bg-white/5 cursor-not-allowed"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Subject</label>
              <InputText v-model="form.subject" required class="w-full" />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                  >Device Type (Optional)</label
                >
                <InputText
                  v-model="form.deviceType"
                  placeholder="Headphone/Speaker Model"
                  class="w-full"
                />
              </div>
              <div class="space-y-2">
                <label :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'"
                  >Preset ID (Optional)</label
                >
                <InputText v-model="form.presetId" placeholder="e.g. prst_123abc" class="w-full" />
              </div>
            </div>

            <div class="space-y-2">
              <label :class="isDarkMode ? 'text-gray-300' : 'text-gray-700'">Message</label>
              <Textarea
                v-model="form.message"
                required
                rows="6"
                class="w-full resize-y"
                placeholder="Describe your query or issue in detail..."
              />
            </div>
            <Button
              :loading="isLoading"
              label="Send Message"
              icon="pi pi-send"
              type="submit"
              class="w-full p-4 p-button-success"
            />
          </form>
        </template>
      </Card>

      <!-- GitHub Repository Card -->
      <a
        href="https://github.com/ErikTitan/pulse-eq"
        target="_blank"
        rel="noopener noreferrer"
        class="block transition-transform hover:scale-[1.02] duration-300 focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
      >
        <Card
          class="bg-glass backdrop-blur-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden relative cursor-pointer group"
          :class="isDarkMode ? 'border-primary-500' : 'border-primary-300'"
        >
          <template #content>
            <div class="flex items-center gap-6 p-2">
              <div
                class="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300"
              >
                <i class="pi pi-github text-4xl"></i>
              </div>
              <div>
                <h3
                  class="text-xl font-bold mb-1"
                  :class="isDarkMode ? 'text-white' : 'text-gray-800'"
                >
                  PULSE-EQ is Open Source
                </h3>
                <p :class="isDarkMode ? 'text-gray-400' : 'text-gray-600'" class="text-sm m-0">
                  Want to contribute, report a bug directly, or view the source code? Visit our
                  repository on GitHub.
                </p>
              </div>
              <div class="ml-auto flex-shrink-0 text-primary pr-2">
                <i class="pi pi-external-link text-xl"></i>
              </div>
            </div>
          </template>
        </Card>
      </a>
    </div>
  </div>
</template>

<style scoped>
.bg-glass {
  background-color: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
}

.my-app-dark .bg-glass {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.125);
}

:deep(.p-inputtext),
:deep(.p-card) {
  background: transparent;
  color: var(--p-text-color);
}

.my-app-dark :deep(.p-inputtext) {
  color: var(--p-text-color);
}

:deep(.p-button) {
  @apply transition-all duration-300;
}
</style>
