<script>
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect'
import Carousel from 'primevue/carousel'
import AuthRequired from '@/components/AuthRequired.vue'
import PresetCard from '@/components/PresetCard.vue'
import PresetPreviewModal from '@/components/PresetPreviewModal.vue'
import { useAuthStore } from '@/stores/authStore'
import { usePresetStore } from '@/stores/presetStore'
import { usePresetCategoryStore } from '@/stores/presetCategoryStore'
import { useEqualizerStore } from '@/stores/equalizerStore'
import { usePreset } from '@/services/presetService'

export default {
  name: 'PresetsGallery',
  emits: ['showLogin', 'showRegister'],
  components: {
    Select,
    InputText,
    MultiSelect,
    Carousel,
    AuthRequired,
    PresetCard,
    PresetPreviewModal,
  },
  props: {
    isDarkMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    const authStore = useAuthStore()
    const presetCategoryStore = usePresetCategoryStore()
    const presetStore = usePresetStore()
    const dummyVariations = [
      { name: 'Deep Bass Boost', color: '#4ade80', data: [6, 5, 2, 0, -1, -1, 0, 1, 2, 3] },
      { name: 'Vocal Clarity', color: '#3b82f6', data: [-2, -1, 0, 1, 3, 4, 3, 1, 0, -1] },
      { name: 'Acoustic Presence', color: '#a855f7', data: [1, 2, 3, 2, 0, -1, 0, 2, 3, 2] },
      { name: 'Studio Reference', color: '#f97316', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { name: 'Gaming Immersion', color: '#ef4444', data: [5, 3, 1, -2, -3, -3, -2, 1, 3, 5] },
      { name: 'Podcast Enhancer', color: '#facc15', data: [-4, -3, -1, 2, 4, 4, 2, 0, -1, -2] },
    ]

    return {
      authStore,
      presetCategoryStore,
      presetStore,
      searchQuery: '',
      selectedCategory: null,
      selectedSort: null,
      selectedTags: [],
      showPreviewModal: false,
      selectedPresetForModal: null,
      sortOptions: [
        { name: 'Popular', value: 'popular' },
        { name: 'New', value: 'new' },
        { name: 'Trending', value: 'trending' },
      ],
      responsiveOptions: [
        {
          breakpoint: '1023px', // max-width for lg (Tailwind is 1024px min-width)
          numVisible: 2,
          numScroll: 1,
        },
        {
          breakpoint: '767px', // max-width for md (Tailwind is 768px min-width)
          numVisible: 1,
          numScroll: 1,
        },
      ],
      dummyPresets: Array.from({ length: 6 }, (_, i) => {
        const variation = dummyVariations[i % dummyVariations.length]
        return {
          id: `dummy-${i}`,
          name: variation.name,
          user: { name: 'Community Member' },
          rating: Math.floor(Math.random() * 5) + 1,
          is_public: true,
          settings: '{}',
          preset_category: { name: 'Various' },
          chartData: {
            labels: ['20', '50', '100', '200', '500', '1k', '2k', '5k', '10k', '20k'],
            datasets: [
              {
                label: 'Gain (dB)',
                data: variation.data,
                fill: false,
                borderColor: variation.color,
                tension: 0.4,
              },
            ],
          },
        }
      }),
    }
  },
  computed: {
    availableTags() {
      if (!this.presetStore.presets) return []
      const tags = new Set()
      this.presetStore.presets.forEach((preset) => {
        if (preset.tags && Array.isArray(preset.tags)) {
          preset.tags.forEach((tag) => {
            tags.add(tag.name || tag)
          })
        }
      })
      return Array.from(tags).sort()
    },
    filteredPresets() {
      if (!this.authStore.isAuthenticated) {
        return this.dummyPresets
      }

      let presetsToFilter = [...this.presetStore.presets]

      if (this.searchQuery) {
        presetsToFilter = presetsToFilter.filter((preset) => {
          const searchLower = this.searchQuery.toLowerCase()
          return (
            preset.name.toLowerCase().includes(searchLower) ||
            (preset.user && preset.user.name.toLowerCase().includes(searchLower))
          )
        })
      }

      if (this.selectedCategory) {
        presetsToFilter = presetsToFilter.filter(
          (preset) => preset.preset_category_id === this.selectedCategory,
        )
      }

      if (this.selectedTags && this.selectedTags.length > 0) {
        presetsToFilter = presetsToFilter.filter((preset) => {
          if (!preset.tags || !Array.isArray(preset.tags)) return false
          return preset.tags.some((tag) => this.selectedTags.includes(tag.name || tag))
        })
      }

      if (this.selectedSort) {
        presetsToFilter.sort((a, b) => {
          if (this.selectedSort === 'popular') {
            return b.usageCount - a.usageCount
          } else if (this.selectedSort === 'new') {
            return new Date(b.createdAt) - new Date(a.createdAt)
          } else if (this.selectedSort === 'trending') {
            return b.rating - a.rating
          }
          return 0
        })
      }

      return presetsToFilter
    },
    isSearchingOrFiltering() {
      return (
        this.searchQuery !== '' ||
        this.selectedCategory !== null ||
        (this.selectedTags && this.selectedTags.length > 0) ||
        this.selectedSort !== null
      )
    },
    groupedPresets() {
      const grouped = {}

      this.filteredPresets.forEach((preset) => {
        const categoryName = preset.preset_category ? preset.preset_category.name : 'Uncategorized'
        if (!grouped[categoryName]) {
          grouped[categoryName] = []
        }
        grouped[categoryName].push(preset)
      })

      // If NOT actively searching/filtering, limit to top 12 popular presets per category
      if (!this.isSearchingOrFiltering) {
        Object.keys(grouped).forEach((category) => {
          // Sort by usageCount (highest first), then rating as tiebreaker
          grouped[category].sort((a, b) => {
            if (b.usageCount !== a.usageCount) {
              return b.usageCount - a.usageCount
            }
            return b.rating - a.rating
          })
          // Limit to max 12 items for the carousel
          grouped[category] = grouped[category].slice(0, 12)
        })
      }

      return grouped
    },
  },
  methods: {
    downloadPreset(preset) {
      if (!this.authStore.isAuthenticated) return
      try {
        const parsedSettings =
          typeof preset.settings === 'string' ? JSON.parse(preset.settings) : preset.settings
        const settingsStr = JSON.stringify(parsedSettings, null, 2)
        const blob = new Blob([settingsStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${preset.name}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Failed to download preset:', error)
      }
    },
    sharePreset(preset) {
      // Handles both dummy (`is_public`) and real (`public`) presets
      const isPublic = preset.public || preset.is_public
      if (!isPublic) {
        this.$toast.add({
          severity: 'warn',
          summary: 'Private Preset',
          detail: 'This preset is private.',
          life: 3000,
        })
        return
      }
      const presetUrl = `${window.location.origin}/presets/${preset.slug}`
      navigator.clipboard
        .writeText(presetUrl)
        .then(() => {
          this.$toast.add({
            severity: 'success',
            summary: 'Link Copied',
            detail: 'Preset link copied to clipboard!',
            life: 3000,
          })
        })
        .catch((err) => {
          console.error('Could not copy text: ', err)
          this.$toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not copy link.',
            life: 3000,
          })
        })
    },
    openPresetModal(preset) {
      this.selectedPresetForModal = preset
      this.showPreviewModal = true
      window.history.pushState({}, '', `/presets/${preset.slug}`)
    },
    closePresetModal() {
      this.showPreviewModal = false
      this.selectedPresetForModal = null
      window.history.pushState({}, '', '/presets')
    },
  },
  mounted() {
    if (this.authStore.isAuthenticated) {
      this.presetStore.fetchPublicPresets()
    }
  },
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br transition-colors duration-300 flex-1 pt-24 px-6 lg:px-20 relative"
  >
    <!-- Background content -->
    <div
      class="container mx-auto px-4 py-8"
      :class="{ 'blur-sm pointer-events-none select-none': !authStore.isAuthenticated }"
    >
      <!-- Filters Section -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <InputText
          v-model="searchQuery"
          placeholder="Search presets..."
          class="input"
          :disabled="!authStore.isAuthenticated"
        />
        <Select
          v-model="selectedCategory"
          :options="presetCategoryStore.categories"
          optionLabel="name"
          optionValue="id"
          placeholder="Category"
          class="w-full"
          :disabled="!authStore.isAuthenticated"
        />
        <Select
          v-model="selectedSort"
          :options="sortOptions"
          optionLabel="name"
          optionValue="value"
          placeholder="Sort by"
          class="w-full"
          :disabled="!authStore.isAuthenticated"
        />
        <MultiSelect
          v-model="selectedTags"
          :options="availableTags"
          placeholder="Tags"
          class="w-full"
          :disabled="!authStore.isAuthenticated"
        />
      </div>

      <!-- Presets Area -->
      <div v-if="authStore.isAuthenticated">
        <!-- Display Carousel View by Default -->
        <div v-if="!isSearchingOrFiltering">
          <div
            v-for="(categoryPresets, categoryName) in groupedPresets"
            :key="categoryName"
            class="mb-8"
          >
            <h2 class="text-2xl font-bold mb-4">{{ categoryName }}</h2>

            <!-- Standard Grid for 3 or fewer items -->
            <div v-if="categoryPresets.length <= 3" class="flex flex-wrap lg:px-[3.25rem]">
              <div
                v-for="preset in categoryPresets"
                :key="preset.id"
                class="w-full md:w-1/2 lg:w-1/3 p-3"
              >
                <div
                  class="block transition-transform hover:-translate-y-1 hover:scale-[1.01] cursor-pointer h-full"
                  @click="openPresetModal(preset)"
                >
                  <PresetCard
                    :preset="preset"
                    @download="downloadPreset"
                    @share="sharePreset"
                    class="h-full flex flex-col"
                  />
                </div>
              </div>
            </div>

            <Carousel
              v-else
              :value="categoryPresets"
              :numVisible="3"
              :numScroll="1"
              :responsiveOptions="responsiveOptions"
              circular
              class="w-full"
            >
              <template #item="slotProps">
                <div class="p-3 h-full pb-6">
                  <div
                    class="block transition-transform hover:-translate-y-1 hover:scale-[1.01] cursor-pointer h-full relative z-10"
                    @click="openPresetModal(slotProps.data)"
                  >
                    <PresetCard
                      :preset="slotProps.data"
                      @download="downloadPreset"
                      @share="sharePreset"
                      class="h-full flex flex-col"
                    />
                  </div>
                </div>
              </template>
            </Carousel>
          </div>
        </div>

        <!-- Display Grid View when Searching/Filtering -->
        <div v-else>
          <div
            v-for="(categoryPresets, categoryName) in groupedPresets"
            :key="categoryName"
            class="mb-8"
          >
            <h2 class="text-2xl font-bold mb-4">{{ categoryName }}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div
                v-for="preset in categoryPresets"
                :key="preset.id"
                class="block transition-transform hover:-translate-y-1 hover:scale-[1.01] cursor-pointer h-full"
                @click="openPresetModal(preset)"
              >
                <PresetCard
                  :preset="preset"
                  @download="downloadPreset"
                  @share="sharePreset"
                  class="h-full flex flex-col"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dummy Presets Grid for non-authenticated users -->
      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="preset in dummyPresets"
            :key="preset.id"
            class="block transition-transform hover:-translate-y-1 hover:scale-[1.01] cursor-pointer h-full"
          >
            <PresetCard :preset="preset" class="h-full flex flex-col" />
          </div>
        </div>
      </div>
    </div>

    <!-- AuthRequired Overlay -->
    <div
      v-if="!authStore.isAuthenticated"
      class="auth-overlay absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
    >
      <AuthRequired @showLogin="$emit('showLogin')" @showRegister="$emit('showRegister')" />
    </div>
    <PresetPreviewModal
      :visible="showPreviewModal"
      :preset="selectedPresetForModal"
      @close="closePresetModal"
      @download="downloadPreset"
    />
  </div>
</template>

<style scoped>
/* Mobile specific carousel fixes */
@media (max-width: 767px) {
  :deep(.p-carousel-item) {
    flex: 1 0 100%;
    width: 100% !important;
    padding-bottom: 1.5rem;
  }
}

:deep(.p-carousel-content) {
  padding: 0.5rem 0 1rem 0;
}

:deep(.p-dropdown),
:deep(.p-multiselect) {
  @apply w-full;
  background: var(--color-input-bg);
}

:deep(.p-dropdown-panel),
:deep(.p-multiselect-panel) {
  background: var(--color-card-bg);
  border-color: var(--color-border);
}

/* Enhanced overlay styling */
.auth-overlay {
  animation: fadeIn 0.3s ease-in-out;
  z-index: 10;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* Prevent scrolling when overlay is active */
.blur-sm {
  filter: blur(4px);
  transition: filter 0.3s ease-in-out;
}
</style>
