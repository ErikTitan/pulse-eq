<script>
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect';
import AuthRequired from '@/components/AuthRequired.vue';
import PresetCard from '@/components/PresetCard.vue';
import { useAuthStore } from '@/stores/authStore';
import { getRealPresets, getDummyPresets } from '@/services/presetsService';

export default {
  name: 'PresetsGallery',
  emits: ['showLogin', 'showRegister'],
  components: {
    Select,
    InputText,
    MultiSelect,
    AuthRequired,
    PresetCard,
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
      presets: [],
      dummyPresets: []
    }
  },
  computed: {
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
    },
    loadPresets() {
      // Load real presets for authenticated users
      this.presets = getRealPresets();
      // Always load dummy presets for the overlay effect
      this.dummyPresets = getDummyPresets();
    }
  },
  mounted() {
    this.loadPresets();
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
        <PresetCard v-for="preset in filteredPresets" :key="preset.id" :preset="preset" @apply="applyPreset"
          @download="downloadPreset" />
      </div>
    </div>

    <!-- AuthRequired Overlay (floating on top when not authenticated) -->
    <div v-if="!authStore.isAuthenticated"
      class="auth-overlay absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <AuthRequired @showLogin="$emit('showLogin')" @showRegister="$emit('showRegister')" />
    </div>
  </div>
</template>

<style scoped>
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
