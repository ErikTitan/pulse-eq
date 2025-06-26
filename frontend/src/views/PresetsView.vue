<script>
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect';
import AuthRequired from '@/components/AuthRequired.vue';
import PresetCard from '@/components/PresetCard.vue';
import { useAuthStore } from '@/stores/authStore';
import { getPublicPresets } from '@/services/presets';
import { usePresetCategoryStore } from '@/stores/presetCategoryStore';
import { useEqualizerStore } from '@/stores/equalizerStore';

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
    const presetCategoryStore = usePresetCategoryStore();
    return {
      authStore,
      presetCategoryStore,
      searchQuery: '',
      selectedCategory: null,
      selectedSort: null,
      selectedDevices: [],
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
    }
  },
  computed: {
    filteredPresets() {
      let presetsToFilter = this.presets;

      if (this.searchQuery) {
        presetsToFilter = presetsToFilter.filter(preset => {
          const searchLower = this.searchQuery.toLowerCase();
          return preset.name.toLowerCase().includes(searchLower) ||
            (preset.user && preset.user.name.toLowerCase().includes(searchLower));
        });
      }

      if (this.selectedCategory) {
        presetsToFilter = presetsToFilter.filter(preset => preset.preset_category_id === this.selectedCategory);
      }

      // TODO: Implement sorting and device filtering

      return presetsToFilter;
    },
    groupedPresets() {
      const grouped = {};
      this.filteredPresets.forEach(preset => {
        const categoryName = preset.preset_category ? preset.preset_category.name : 'Uncategorized';
        if (!grouped[categoryName]) {
          grouped[categoryName] = [];
        }
        grouped[categoryName].push(preset);
      });
      return grouped;
    }
  },
  methods: {
    applyPreset(preset) {
      try {
        const equalizerStore = useEqualizerStore();
        const settings = JSON.parse(preset.settings);
        equalizerStore.loadPreset(settings);
        this.$router.push('/equalizer');
      } catch (error) {
        console.error('Failed to apply preset:', error);
      }
    },
    downloadPreset(preset) {
      try {
        const settings = JSON.stringify(JSON.parse(preset.settings), null, 2);
        const blob = new Blob([settings], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${preset.name}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Failed to download preset:', error);
      }
    },
    async loadPresets() {
      try {
        const response = await getPublicPresets();
        this.presets = response.data.map(p => {
          let settingsArray = [];
          try {
            if (p.settings && typeof p.settings === 'string') {
              const parsed = JSON.parse(p.settings);
              if (Array.isArray(parsed)) {
                settingsArray = parsed;
              }
            }
          } catch (e) {
            console.error(`Failed to parse settings for preset ID ${p.id}:`, p.settings, e);
          }

          const formatFrequency = (freq) => {
            if (freq >= 1000) {
              return `${Math.round(freq / 1000)}kHz`;
            }
            return `${Math.round(freq)}Hz`;
          };

          const transformedPreset = {
            id: p.id,
            name: p.name || 'Unnamed Preset',
            creator: p.user?.name || 'Anonymous',
            preset_category_id: p.preset_category_id,
            preset_category: p.preset_category || { name: 'General' },
            tags: p.tags || [],
            usageCount: p.usage_count || 0,
            rating: p.rating || 0,
            isStaffPick: p.is_staff_pick || false,
            settings: p.settings,
            public: p.public,
            color: p.color || '#4ade80',
            chartData: {
              labels: settingsArray.map(band => formatFrequency(band.frequency)),
              datasets: [
                {
                  label: 'EQ Curve',
                  data: settingsArray.map(band => band.gain || 0),
                  borderColor: p.color || '#4ade80',
                  tension: 0.4,
                },
              ],
            },
          };
          return transformedPreset;
        });
      } catch (error) {
        console.error('Error loading public presets:', error);
      }
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
        <Select v-model="selectedCategory" :options="presetCategoryStore.categories" optionLabel="name" optionValue="id"
          placeholder="Category" class="w-full" />
        <Select v-model="selectedSort" :options="sortOptions" optionLabel="name" placeholder="Sort by" class="w-full" />
        <MultiSelect v-model="selectedDevices" :options="devices" placeholder="Compatible devices" class="w-full" />
      </div>

      <!-- Presets Grid -->
      <div v-for="(categoryPresets, categoryName) in groupedPresets" :key="categoryName" class="mb-8">
        <h2 class="text-2xl font-bold mb-4">{{ categoryName }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PresetCard v-for="preset in categoryPresets" :key="preset.id" :preset="preset" @apply="applyPreset"
            @download="downloadPreset" />
        </div>
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
