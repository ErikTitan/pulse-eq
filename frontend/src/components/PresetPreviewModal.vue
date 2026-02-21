<template>
  <div
    v-if="visible || slug"
    class="preset-preview-modal fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" @click="handleClose"></div>

    <!-- Modal Content -->
    <div class="relative max-w-lg w-full">
      <Card class="overflow-hidden shadow-2xl modal-card" :style="cardStyle">
        <template #content>
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-8">
            <i class="pi pi-spin pi-spinner text-primary" style="font-size: 2rem"></i>
            <p class="mt-4" style="color: var(--p-text-muted-color)">Loading preset...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-8">
            <div class="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 class="text-xl font-bold mb-2" style="color: var(--p-text-color)">
              Preset Not Found
            </h2>
            <p class="mb-4" style="color: var(--p-text-muted-color)">
              The preset you're looking for doesn't exist or has been removed.
            </p>
            <Button label="Go Back" icon="pi pi-arrow-left" @click="handleClose" />
          </div>

          <!-- Preset Content -->
          <div v-else-if="currentPreset" class="preset-content">
            <!-- Close Button -->
            <button
              @click="handleClose"
              class="absolute top-4 right-4 z-10 transition-colors"
              style="color: var(--p-text-muted-color)"
              onmouseover="this.style.color='var(--p-text-color)'"
              onmouseout="this.style.color='var(--p-text-muted-color)'"
            >
              <i class="pi pi-times text-xl"></i>
            </button>

            <!-- Header Section -->
            <div class="mb-6">
              <div class="pr-8">
                <h1 class="text-2xl font-bold mb-2" style="color: var(--p-text-color)">
                  {{ currentPreset.name }}
                </h1>
                <div
                  class="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm mb-4"
                  style="color: var(--p-text-muted-color)"
                >
                  <span
                    >by {{ currentPreset.user?.name || currentPreset.creator || 'Anonymous' }}</span
                  >
                  <span>•</span>
                  <span>{{ currentPreset.uses_count || currentPreset.usageCount || 0 }} users</span>
                  <span>•</span>
                  <Tag :value="currentPreset.preset_category?.name || 'General'" class="text-xs" />
                </div>
              </div>

              <!-- Rating Section -->
              <div
                v-if="authStore.isAuthenticated && authStore.user?.id !== currentPreset.user?.id"
                class="flex items-center p-3 rounded-lg border border-surface relative"
                style="background: var(--p-content-hover-background)"
              >
                <div class="flex items-center flex-1 gap-3">
                  <span class="text-sm font-medium" style="color: var(--p-text-color)"
                    >Your Rating:</span
                  >
                  <Rating
                    v-model="selectedRating"
                    :readonly="
                      !authStore.isAuthenticated ||
                      isRatingInProgress ||
                      authStore.user?.id === currentPreset.user?.id ||
                      userRating > 0
                    "
                    :cancel="false"
                  />
                  <transition name="fade">
                    <Button
                      v-if="showSubmitButton"
                      label="Submit"
                      @click="submitRating"
                      :loading="isRatingInProgress"
                      class="p-button-sm ml-2"
                    />
                  </transition>
                </div>
              </div>
            </div>

            <!-- EQ Preview -->
            <MiniEqPreview
              :preset="transformedPreset"
              :show-audio-preview="true"
              class="mb-6"
            />

            <!-- Action Buttons -->
            <div class="flex space-x-3 mb-6">
              <Button
                @click="handleApply"
                label="Apply Preset"
                severity="success"
                class="flex-1"
              />
              <Button
                @click="handleDownload"
                label="Download"
                severity="info"
                class="flex-1"
              />
            </div>

            <!-- Description -->
            <div v-if="currentPreset.description" class="mb-4">
              <h3 class="text-sm font-semibold mb-2" style="color: var(--p-text-color)">
                Description
              </h3>
              <p
                class="text-sm leading-relaxed p-3 rounded-lg border border-surface"
                style="
                  color: var(--p-text-muted-color);
                  background: var(--p-content-hover-background);
                "
              >
                {{ currentPreset.description }}
              </p>
            </div>

            <!-- Tags -->
            <div v-if="currentPreset.tags?.length" class="mb-4">
              <h3 class="text-sm font-semibold mb-2" style="color: var(--p-text-color)">Tags</h3>
              <div class="flex flex-wrap gap-2">
                <Tag v-for="tag in currentPreset.tags" :key="tag.id" :value="tag.name" />
              </div>
            </div>

            <!-- Additional Details -->
            <div
              v-if="currentPreset.created_at"
              class="text-xs"
              style="color: var(--p-text-muted-color)"
            >
              Created on {{ formatDate(currentPreset.created_at) }}
            </div>

            <!-- SEO Content (Hidden but crawlable) -->
            <div class="hidden">
              <h2>About this EQ Preset</h2>
              <p>
                The "{{ currentPreset.name }}" equalizer preset by
                {{ currentPreset.user?.name || currentPreset.creator || 'Anonymous' }}
                <span v-if="currentPreset.description"
                  >is {{ currentPreset.description.toLowerCase() }}</span
                >
                <span v-else>provides professional-quality audio enhancement</span>. This preset has
                been used by {{ currentPreset.uses_count || currentPreset.usageCount || 0 }} users
                and belongs to the {{ currentPreset.preset_category?.name || 'General' }} category.
              </p>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script>
import { mapStores } from 'pinia'
import { usePresetStore } from '@/stores/presetStore'
import { useAuthStore } from '@/stores/authStore'
import MiniEqPreview from './MiniEqPreview.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Rating from 'primevue/rating'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'
import { seoManager } from '@/utils/seoManager'
import { ratePreset, usePreset } from '@/services/presetService'
import axios from '@/axios'

export default {
  name: 'PresetPreviewModal',
  components: {
    MiniEqPreview,
    Card,
    Button,
    Rating,
    Tag,
  },
  props: {
    visible: { type: Boolean, default: false },
    preset: { type: Object, default: null },
    slug: { type: String, default: null },
  },
  emits: ['close', 'download'],
  data() {
    return {
      loading: false,
      error: false,
      fetchedPreset: null,
      userRating: 0,
      selectedRating: 0,
      isRatingInProgress: false,
    }
  },
  computed: {
    ...mapStores(usePresetStore, useAuthStore),
    cardStyle() {
      if (!this.currentPreset) return {}
      const color = this.currentPreset.color || '#4ade80'
      const { r, g, b } = this.parseHexColor(color)
      return {
        '--shadow-color-rgb': `${r}, ${g}, ${b}`,
      }
    },
    showSubmitButton() {
      return this.selectedRating > 0 && this.selectedRating !== this.userRating
    },
    currentPreset() {
      return this.preset || this.fetchedPreset
    },
    transformedPreset() {
      if (!this.currentPreset) return null
      return {
        id: this.currentPreset.id,
        name: this.currentPreset.name,
        slug: this.currentPreset.slug,
        description: this.currentPreset.description,
        creator: this.currentPreset.user?.name || this.currentPreset.creator || 'Anonymous',
        settings: this.currentPreset.settings,
        color: this.currentPreset.color || '#4ade80',
        usageCount: this.currentPreset.uses_count || this.currentPreset.usageCount || 0,
        rating: this.currentPreset.ratings_avg || this.currentPreset.rating || 0,
        preset_category: this.currentPreset.preset_category,
        tags: this.currentPreset.tags || [],
      }
    },
  },
  watch: {
    visible(isVisible) {
      if (isVisible) {
        document.addEventListener('keydown', this.handleEscape)
        document.body.style.overflow = 'hidden'
      } else {
        document.removeEventListener('keydown', this.handleEscape)
        document.body.style.overflow = ''
      }
    },
    slug: {
      immediate: true,
      handler(newSlug) {
        if (newSlug && !this.preset) {
          this.fetchPresetData(newSlug)
        }
      },
    },
    preset: {
      immediate: true,
      handler(newPreset) {
        if (newPreset) {
          this.userRating = newPreset.user_rating || 0
          this.selectedRating = this.userRating
        }
      },
    },
  },
  created() {
    this.toast = useToast()
  },
  mounted() {
    if (this.slug && !this.preset) {
      this.fetchPresetData(this.slug)
    }
  },
  beforeUnmount() {
    if (!this.visible) {
      seoManager.reset()
    }
    document.removeEventListener('keydown', this.handleEscape)
    document.body.style.overflow = ''
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },
    parseHexColor(hex) {
      let color = hex || '#4ade80'
      if (!color.startsWith('#')) {
        color = `#${color}`
      }
      if (!/^#[0-9A-F]{6}$/i.test(color)) {
        color = '#4ade80'
      }
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color)
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    },
    async fetchPresetData(slug) {
      if (!slug) return
      this.loading = true
      this.error = false
      try {
        const response = await axios.get(`/presets/slug/${slug}`)
        this.fetchedPreset = response.data
        this.userRating = response.data.user_rating || 0
        this.selectedRating = this.userRating
        if (!this.visible) {
          seoManager.setPresetSEO({
            name: response.data.name,
            description: response.data.description,
            creator: response.data.user?.name || 'Anonymous',
            rating: response.data.ratings_avg || 0,
            usageCount: response.data.uses_count || 0,
          })
        }
      } catch (err) {
        this.error = true
      } finally {
        this.loading = false
      }
    },
    async submitRating() {
      if (!this.authStore.isAuthenticated || this.isRatingInProgress || !this.showSubmitButton)
        return

      this.isRatingInProgress = true

      try {
        const response = await ratePreset(this.currentPreset.slug, this.selectedRating)
        this.presetStore.updatePreset(response.data)
        this.userRating = this.selectedRating
      } catch (error) {
        this.selectedRating = this.userRating
        if (error.response && error.response.status === 403) {
          this.toast.add({
            severity: 'error',
            summary: 'Unauthorized',
            detail:
              'You have already rated this preset or you are not allowed to rate your own preset.',
            life: 3000,
          })
        } else {
          this.toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to submit rating.',
            life: 3000,
          })
        }
      } finally {
        this.isRatingInProgress = false
      }
    },
    async handleApply() {
      try {
        const settings =
          typeof this.currentPreset.settings === 'string'
            ? JSON.parse(this.currentPreset.settings)
            : this.currentPreset.settings

        // Apply preset locally
        this.presetStore.applyPreset(settings)

        // Track usage on backend (increment counter)
        if (this.currentPreset.slug) {
          try {
            await usePreset(this.currentPreset.slug)
            // Optionally update the local usage count
            if (this.fetchedPreset) {
              this.fetchedPreset.uses_count = (this.fetchedPreset.uses_count || 0) + 1
            }
          } catch (apiError) {
            // Don't block the user experience if API call fails
            console.warn('Failed to track preset usage:', apiError)
          }
        }

        this.handleClose()
        this.$router.push({ name: 'equalizer' })
      } catch (error) {
        // Handle or log error applying preset
        console.error('Error applying preset:', error)
      }
    },
    handleDownload() {
      try {
        const settings = JSON.stringify(JSON.parse(this.currentPreset.settings), null, 2)
        const blob = new Blob([settings], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${this.currentPreset.name}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        this.$emit('download', this.currentPreset)
      } catch (error) {
        // Handle or log error downloading preset
      }
    },
    handleClose() {
      this.$emit('close')
      if (this.$route.name === 'PresetDetail') {
        this.$router.push({ name: this.authStore.isAuthenticated ? 'presets' : 'home' })
      }
    },
    handleEscape(event) {
      if (event.key === 'Escape' && (this.visible || (this.slug && !this.preset))) {
        this.handleClose()
      }
    },
  },
}
</script>

<style scoped>
.preset-preview-modal {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.preset-preview-modal > div:last-child {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

:deep(.p-rating .p-rating-icon.p-rating-icon-active) {
  color: var(--p-primary-color);
}

:deep(.modal-card) {
  background: var(--p-content-background);
  border: 1px solid var(--p-surface-border);
  transition: box-shadow 0.3s ease-in-out;
  box-shadow:
    0 20px 25px -5px rgba(var(--shadow-color-rgb), 0.2),
    0 10px 10px -5px rgba(var(--shadow-color-rgb), 0.1);
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
