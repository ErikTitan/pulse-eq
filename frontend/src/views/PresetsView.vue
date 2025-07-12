<script>
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import MultiSelect from 'primevue/multiselect';
import AuthRequired from '@/components/AuthRequired.vue';
import PresetCard from '@/components/PresetCard.vue';
import PresetPreviewModal from '@/components/PresetPreviewModal.vue';
import { useAuthStore } from '@/stores/authStore';
import { usePresetStore } from '@/stores/presetStore';
import { usePresetCategoryStore } from '@/stores/presetCategoryStore';
import { useEqualizerStore } from '@/stores/equalizerStore';
import { usePreset } from '@/services/presetService';

export default {
  name: 'PresetsGallery',
  emits: ['showLogin', 'showRegister'],
  components: {
    Select,
    InputText,
    MultiSelect,
    AuthRequired,
    PresetCard,
    PresetPreviewModal,
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
    const presetStore = usePresetStore();
    const dummyVariations = [
      { name: 'Deep Bass Boost', color: '#4ade80', data: [6, 5, 2, 0, -1, -1, 0, 1, 2, 3] },
      { name: 'Vocal Clarity', color: '#3b82f6', data: [-2, -1, 0, 1, 3, 4, 3, 1, 0, -1] },
      { name: 'Acoustic Presence', color: '#a855f7', data: [1, 2, 3, 2, 0, -1, 0, 2, 3, 2] },
      { name: 'Studio Reference', color: '#f97316', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
      { name: 'Gaming Immersion', color: '#ef4444', data: [5, 3, 1, -2, -3, -3, -2, 1, 3, 5] },
      { name: 'Podcast Enhancer', color: '#facc15', data: [-4, -3, -1, 2, 4, 4, 2, 0, -1, -2] }
    ];

    return {
      authStore,
      presetCategoryStore,
      presetStore,
      searchQuery: '',
      selectedCategory: null,
      selectedSort: null,
      selectedDevices: [],
      showPreviewModal: false,
      selectedPresetForModal: null,
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
      dummyPresets: Array.from({ length: 6 }, (_, i) => {
        const variation = dummyVariations[i % dummyVariations.length];
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
                tension: 0.4
              }
            ]
          }
        }
      })
    }
  },
  computed: {
    filteredPresets() {
      if (!this.authStore.isAuthenticated) {
        return this.dummyPresets;
      }

      let presetsToFilter = this.presetStore.presets;

      if (this.searchQuery) {
        presetsToFilter = presetsToFilter.filter(preset => {
          const searchLower = this.searchQuery.toLowerCase();
          return preset.name.toLowerCase().includes(searchLower) ||
            (preset.user && preset.user.name.toLowerCase().includes(searchLower));
        });
      }

      if (this.selectedCategory) {
        presetsToFilter = presetsToFilter.filter(preset => preset.preset_category_id === this.selected.id);
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
    downloadPreset(preset) {
      if (!this.authStore.isAuthenticated) return;
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
    sharePreset(preset) {
      // Handles both dummy (`is_public`) and real (`public`) presets
      const isPublic = preset.public || preset.is_public;
      if (!isPublic) {
        this.$toast.add({ severity: 'warn', summary: 'Private Preset', detail: 'This preset is private.', life: 3000 });
        return;
      }
      const presetUrl = `${window.location.origin}/presets/${preset.slug}`;
      navigator.clipboard.writeText(presetUrl).then(() => {
        this.$toast.add({ severity: 'success', summary: 'Link Copied', detail: 'Preset link copied to clipboard!', life: 3000 });
      }).catch(err => {
        console.error('Could not copy text: ', err);
        this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Could not copy link.', life: 3000 });
      });
    },
    openPresetModal(preset) {
      this.selectedPresetForModal = preset;
      this.showPreviewModal = true;
      window.history.pushState({}, '', `/presets/${preset.slug}`);
    },
    closePresetModal() {
      this.showPreviewModal = false;
      this.selectedPresetForModal = null;
      window.history.pushState({}, '', '/presets');
    },
  },
  mounted() {
    if (this.authStore.isAuthenticated) {
      this.presetStore.fetchPublicPresets();
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br transition-colors duration-300 flex-1 pt-24 px-6 lg:px-20 relative">
    <!-- Background content -->
    <div class="container mx-auto px-4 py-8"
      :class="{ 'blur-sm pointer-events-none select-none': !authStore.isAuthenticated }">
      <!-- Filters Section -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <InputText v-model="searchQuery" placeholder="Search presets..." class="input"
          :disabled="!authStore.isAuthenticated" />
        <Select v-model="selectedCategory" :options="presetCategoryStore.categories" optionLabel="name" optionValue="id"
          placeholder="Category" class="w-full" :disabled="!authStore.isAuthenticated" />
        <Select v-model="selectedSort" :options="sortOptions" optionLabel="name" placeholder="Sort by" class="w-full"
          :disabled="!authStore.isAuthenticated" />
        <MultiSelect v-model="selectedDevices" :options="devices" placeholder="Compatible devices" class="w-full"
          :disabled="!authStore.isAuthenticated" />
      </div>

      <!-- Presets Grid -->
      <div v-if="authStore.isAuthenticated">
        <div v-for="(categoryPresets, categoryName) in groupedPresets" :key="categoryName" class="mb-8">
          <h2 class="text-2xl font-bold mb-4">{{ categoryName }}</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="preset in categoryPresets" :key="preset.id"
              class="block transition-transform hover:scale-105 cursor-pointer" @click="openPresetModal(preset)">
              <PresetCard :preset="preset" @download="downloadPreset" @share="sharePreset" />
            </div>
          </div>
        </div>
      </div>

      <!-- Dummy Presets Grid for non-authenticated users -->
      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PresetCard v-for="preset in dummyPresets" :key="preset.id" :preset="preset" />
        </div>
      </div>
    </div>

    <!-- AuthRequired Overlay -->
    <div v-if="!authStore.isAuthenticated"
      class="auth-overlay absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <AuthRequired @showLogin="$emit('showLogin')" @showRegister="$emit('showRegister')" />
    </div>
    <PresetPreviewModal :visible="showPreviewModal" :preset="selectedPresetForModal" @close="closePresetModal"
      @download="downloadPreset" />
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
