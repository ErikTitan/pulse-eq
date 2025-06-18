<script>
import Card from 'primevue/card'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import Badge from 'primevue/badge'
import Rating from 'primevue/rating';
import Chart from 'primevue/chart';
import MultiSelect from 'primevue/multiselect';
import AuthRequired from '@/components/AuthRequired.vue';
import { useAuthStore } from '@/stores/authStore';

export default {
  name: 'PresetsGallery',
  emits: ['showLogin', 'showRegister'],
  components: {
    Card,
    Button,
    Select,
    InputText,
    Tag,
    Badge,
    Rating,
    Chart,
    MultiSelect,
    AuthRequired,
  },
  props: {
    isDarkMode: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const authStore = useAuthStore();
    return {
      authStore,
      searchQuery: '',
      selectedCategory: null,
      selectedSort: null,
      selectedDevices: [],
      categories: [
        { name: 'All Presets', value: null },
        { name: 'Gaming', value: 'gaming' },
        { name: 'Music', value: 'music' },
        { name: 'Headphone Correction', value: 'correction' }
      ],
      sortOptions: [
        { name: 'Popular', value: 'popular' },
        { name: 'New', value: 'new' },
        { name: 'Trending', value: 'trending' }
      ],
      devices: [
        'HD 600',
        'HD 650',
        'DT 990 Pro',
        'Apple AirPods Pro',
        'Sony WH-1000XM4'
      ],
      presets: [
        {
          id: 1,
          name: 'Competitive FPS Pro',
          creator: 'AudioWizard',
          category: 'gaming',
          tags: ['FPS', 'Competitive', 'HD600'],
          usageCount: 15420,
          rating: 4.8,
          isStaffPick: true,
          chartData: {
            labels: ['20Hz', '100Hz', '1kHz', '10kHz', '20kHz'],
            datasets: [{
              label: 'EQ Curve',
              data: [-2, -1, 0, 3, 2],
              borderColor: '#22c55e',
              tension: 0.4
            }]
          }
        },
      ],
      dummyPresets: [
        {
          id: 'dummy1',
          name: 'Gaming Beast Mode',
          creator: 'ProGamer',
          category: 'gaming',
          tags: ['Gaming', 'Bass Boost', 'HD650'],
          usageCount: 12500,
          rating: 4.7,
          isStaffPick: false,
          chartData: {
            labels: ['20Hz', '100Hz', '1kHz', '10kHz', '20kHz'],
            datasets: [{
              label: 'EQ Curve',
              data: [1, 2, -1, 4, 1],
              borderColor: '#3b82f6',
              tension: 0.4
            }]
          }
        },
        {
          id: 'dummy2',
          name: 'Audiophile Perfection',
          creator: 'AudioMaster',
          category: 'music',
          tags: ['Music', 'Reference', 'DT990'],
          usageCount: 18300,
          rating: 4.9,
          isStaffPick: true,
          chartData: {
            labels: ['20Hz', '100Hz', '1kHz', '10kHz', '20kHz'],
            datasets: [{
              label: 'EQ Curve',
              data: [0, -1, 1, 2, -1],
              borderColor: '#f59e0b',
              tension: 0.4
            }]
          }
        },
        {
          id: 'dummy3',
          name: 'Studio Monitor',
          creator: 'StudioPro',
          category: 'correction',
          tags: ['Studio', 'Flat', 'AirPods Pro'],
          usageCount: 9800,
          rating: 4.6,
          isStaffPick: false,
          chartData: {
            labels: ['20Hz', '100Hz', '1kHz', '10kHz', '20kHz'],
            datasets: [{
              label: 'EQ Curve',
              data: [-1, 0, 0, 1, 0],
              borderColor: '#8b5cf6',
              tension: 0.4
            }]
          }
        },
        {
          id: 'dummy4',
          name: 'Warm Vocals',
          creator: 'VocalExpert',
          category: 'music',
          tags: ['Vocals', 'Warm', 'Sony WH-1000XM4'],
          usageCount: 7200,
          rating: 4.5,
          isStaffPick: false,
          chartData: {
            labels: ['20Hz', '100Hz', '1kHz', '10kHz', '20kHz'],
            datasets: [{
              label: 'EQ Curve',
              data: [0, 1, 2, 1, -1],
              borderColor: '#ef4444',
              tension: 0.4
            }]
          }
        },
        {
          id: 'dummy5',
          name: 'Bass Head Special',
          creator: 'BassLover',
          category: 'music',
          tags: ['Bass', 'EDM', 'HD600'],
          usageCount: 11100,
          rating: 4.4,
          isStaffPick: false,
          chartData: {
            labels: ['20Hz', '100Hz', '1kHz', '10kHz', '20kHz'],
            datasets: [{
              label: 'EQ Curve',
              data: [3, 2, 0, -1, 0],
              borderColor: '#10b981',
              tension: 0.4
            }]
          }
        },
        {
          id: 'dummy6',
          name: 'Classical Clarity',
          creator: 'ClassicalFan',
          category: 'music',
          tags: ['Classical', 'Clear', 'HD650'],
          usageCount: 6500,
          rating: 4.8,
          isStaffPick: true,
          chartData: {
            labels: ['20Hz', '100Hz', '1kHz', '10kHz', '20kHz'],
            datasets: [{
              label: 'EQ Curve',
              data: [-1, 0, 1, 3, 2],
              borderColor: '#f97316',
              tension: 0.4
            }]
          }
        }
      ]
    }
  },
  computed: {
    chartOptions() {
      return {
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            display: false,
            min: -12,
            max: 12
          },
          x: {
            display: false
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    },
    filteredPresets() {
      const presetsToFilter = this.authStore.isAuthenticated ? this.presets : this.dummyPresets;
      return presetsToFilter.filter(preset => {
        const matchesSearch = preset.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          preset.creator.toLowerCase().includes(this.searchQuery.toLowerCase())
        const matchesCategory = !this.selectedCategory || preset.category === this.selectedCategory
        const matchesDevices = this.selectedDevices.length === 0 ||
          preset.tags.some(tag => this.selectedDevices.includes(tag))
        return matchesSearch && matchesCategory && matchesDevices
      })
    }
  },
  methods: {
    applyPreset(preset) {
      console.log('Applying preset:', preset.name)
    },
    downloadPreset(preset) {
      console.log('Downloading preset:', preset.name)
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br transition-colors duration-300 flex-1 pt-24 px-6 lg:px-20 relative">
    <!-- Background content (always visible, blurred when not authenticated) -->
    <div class="container mx-auto px-4 py-8"
      :class="{ 'blur-sm pointer-events-none select-none': !authStore.isAuthenticated }">
      <!-- Filters Section -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <InputText v-model="searchQuery" placeholder="Search presets..." class="input" />
        <Select v-model="selectedCategory" :options="categories" optionLabel="name" placeholder="Category"
          class="w-full" />
        <Select v-model="selectedSort" :options="sortOptions" optionLabel="name" placeholder="Sort by" class="w-full" />
        <MultiSelect v-model="selectedDevices" :options="devices" placeholder="Compatible devices" class="w-full" />
      </div>

      <!-- Presets Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="preset in filteredPresets" :key="preset.id"
          class="preset-card transform transition-all duration-300 hover:scale-102 hover:shadow-lg">
          <Card class="card h-full">
            <template #header>
              <div class="relative h-32">
                <Chart type="line" :data="preset.chartData" :options="chartOptions" class="w-full h-full" />
                <Badge v-if="preset.isStaffPick" value="Staff Pick" class="absolute top-2 right-2" severity="success" />
              </div>
            </template>
            <template #title>
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-xl font-bold">{{ preset.name }}</h3>
                  <p class="text-sm text-text-secondary">by {{ preset.creator }}</p>
                </div>
                <Rating :modelValue="preset.rating" readonly :cancel="false" />
              </div>
            </template>
            <template #content>
              <div class="space-y-4">
                <div class="flex flex-wrap gap-2">
                  <Tag v-for="tag in preset.tags" :key="tag" :value="tag" class="text-xs" />
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-text-secondary">
                    {{ preset.usageCount.toLocaleString() }} users
                  </span>
                  <div class="flex gap-2">
                    <Button icon="pi pi-play" class="p-button-rounded p-button-outlined" @click="applyPreset(preset)"
                      tooltip="Quick Apply" />
                    <Button icon="pi pi-download" class="p-button-rounded p-button-outlined"
                      @click="downloadPreset(preset)" tooltip="Download" />
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>
    </div>

    <!-- AuthRequired Overlay (floating on top when not authenticated) -->
    <div v-if="!authStore.isAuthenticated"
      class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <AuthRequired @showLogin="$emit('showLogin')" @showRegister="$emit('showRegister')" />
    </div>
  </div>
</template>

<style scoped>
.preset-card {
  @apply relative;
}

.preset-card:hover {
  transform: translateY(-2px);
}

:deep(.p-card) {
  @apply h-full;
}

:deep(.p-card-content) {
  @apply p-4;
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

:deep(.p-tag) {
  background: var(--color-accent-primary);
}

:deep(.p-badge) {
  background: var(--color-accent-primary);
}

:deep(.p-rating-icon) {
  color: var(--color-accent-primary);
}

/* Enhanced overlay styling */
.auth-overlay {
  animation: fadeIn 0.3s ease-in-out;
  z-index: 50;
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
