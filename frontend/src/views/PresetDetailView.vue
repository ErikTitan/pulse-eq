<template>
  <!-- Modal Overlay -->
  <div class="preset-detail-view fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Background Blur -->
    <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" @click="handleBackgroundClick"></div>

    <!-- Modal Card -->
    <div class="relative max-w-2xl w-full max-h-[85vh]">
      <Card class="preset-detail-card overflow-hidden">
        <template #content>
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-8">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p class="text-gray-400">Loading preset...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-8">
            <div class="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 class="text-xl font-bold text-white mb-2">Preset Not Found</h2>
            <p class="text-gray-400 mb-4">The preset you're looking for doesn't exist or has been removed.</p>
            <Button label="Go Back" icon="pi pi-arrow-left" @click="handleClose" />
          </div>

          <!-- Preset Content -->
          <div v-else-if="preset" class="preset-content">
            <!-- Close Button -->
            <button @click="handleClose"
              class="absolute top-4 right-4 text-gray-400 hover:text-white z-10 bg-gray-700 hover:bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
              <i class="pi pi-times text-sm"></i>
            </button>

            <!-- Header Section (Simple) -->
            <div class="preset-header mb-6 pr-10">
              <h1 class="text-2xl font-bold text-white mb-2">{{ preset.name }}</h1>
              <p class="text-gray-400 mb-3">by {{ preset.user?.name || 'Anonymous' }}</p>

              <!-- Info badges -->
              <div class="flex flex-wrap gap-2 text-xs">
                <span v-if="preset.ratings_avg_rating" class="bg-yellow-600 text-white px-2 py-1 rounded-full">
                  ⭐ {{ preset.ratings_avg_rating.toFixed(1) }}
                </span>
                <span class="bg-blue-600 text-white px-2 py-1 rounded-full">
                  {{ preset.uses_count || 0 }} users
                </span>
                <span class="bg-purple-600 text-white px-2 py-1 rounded-full">
                  {{ preset.preset_category?.name || 'General' }}
                </span>
              </div>
            </div>

            <!-- Scrollable Content -->
            <div class="overflow-y-auto max-h-[60vh] space-y-4">
              <!-- EQ Preview -->
              <div class="mb-4">
                <MiniEqPreview :preset="transformedPreset" :show-audio-preview="true" @apply="handleApply"
                  @download="handleDownload" />
              </div>

              <!-- Description -->
              <div v-if="preset.description" class="bg-gray-700 rounded-lg p-4">
                <h3 class="text-sm font-semibold text-gray-300 mb-2">Description</h3>
                <p class="text-gray-300 text-sm leading-relaxed">{{ preset.description }}</p>
              </div>

              <!-- Tags -->
              <div v-if="preset.tags?.length" class="bg-gray-700 rounded-lg p-4">
                <h3 class="text-sm font-semibold text-gray-300 mb-2">Tags</h3>
                <div class="flex flex-wrap gap-2">
                  <span v-for="tag in preset.tags" :key="tag.id"
                    class="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                    {{ tag.name }}
                  </span>
                </div>
              </div>

              <!-- Quick Stats -->
              <div class="bg-gray-700 rounded-lg p-4">
                <h3 class="text-sm font-semibold text-gray-300 mb-3">Details</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-400">Created:</span>
                    <span class="text-gray-300">{{ formatDate(preset.created_at) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-400">Usage:</span>
                    <span class="text-gray-300">{{ preset.uses_count || 0 }} times</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- SEO Content (Hidden but crawlable) -->
            <div class="hidden">
              <h2>About this EQ Preset</h2>
              <p>
                The "{{ preset.name }}" equalizer preset by {{ preset.user?.name || 'Anonymous' }}
                <span v-if="preset.description">is {{ preset.description.toLowerCase() }}</span>
                <span v-else>provides professional-quality audio enhancement</span>.
                This preset has been used by {{ preset.uses_count || 0 }} users and belongs to the
                {{ preset.preset_category?.name || 'General' }} category.
              </p>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePresetStore } from '@/stores/presetStore';
import { seoManager } from '@/utils/seoManager';
import MiniEqPreview from '@/components/MiniEqPreview.vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import axios from '@/axios';

const route = useRoute();
const router = useRouter();
const presetStore = usePresetStore();

const loading = ref(true);
const error = ref(false);
const preset = ref(null);

const transformedPreset = computed(() => {
  if (!preset.value) return null;

  return {
    id: preset.value.id,
    name: preset.value.name,
    slug: preset.value.slug,
    description: preset.value.description,
    creator: preset.value.user?.name || 'Anonymous',
    settings: preset.value.settings,
    color: preset.value.color || '#4ade80',
    usageCount: preset.value.uses_count || 0,
    rating: preset.value.ratings_avg_rating || 0,
    preset_category: preset.value.preset_category,
    tags: preset.value.tags || []
  };
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const handleApply = () => {
  try {
    const settings = typeof preset.value.settings === 'string'
      ? JSON.parse(preset.value.settings)
      : preset.value.settings;
    presetStore.applyPreset(settings);
    router.push({ name: 'equalizer' });
  } catch (error) {
    console.error('Error applying preset:', error);
  }
};

const handleDownload = () => {
  try {
    const settings = JSON.stringify(JSON.parse(preset.value.settings), null, 2);
    const blob = new Blob([settings], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${preset.value.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download preset:', error);
  }
};

const handleClose = () => {
  // Navigate to home instead of presets to avoid auth issues
  router.push({ name: 'home' });
};

const handleBackgroundClick = () => {
  handleClose();
};

const navigateToPresets = () => {
  router.push({ name: 'home' });
};

// Escape key handler
const handleEscape = (event) => {
  if (event.key === 'Escape') {
    handleClose();
  }
};

onMounted(async () => {
  // Add escape key listener
  document.addEventListener('keydown', handleEscape);
  // Prevent body scroll
  document.body.style.overflow = 'hidden';

  const slug = route.params.slug;
  try {
    const response = await axios.get(`/presets/slug/${slug}`);
    preset.value = response.data;

    // Enhanced SEO with structured data
    seoManager.setPresetSEO({
      name: preset.value.name,
      description: preset.value.description,
      creator: preset.value.user?.name || 'Anonymous',
      rating: preset.value.ratings_avg_rating || 0,
      usageCount: preset.value.uses_count || 0
    });

    loading.value = false;
  } catch (err) {
    console.error('Failed to fetch preset:', err);
    error.value = true;
    loading.value = false;
  }
});

// Clean up SEO data when component unmounts
onUnmounted(() => {
  seoManager.reset();
  // Remove escape key listener
  document.removeEventListener('keydown', handleEscape);
  // Restore body scroll
  document.body.style.overflow = '';
});
</script>

<style scoped>
.preset-detail-view {
  animation: fadeIn 0.3s ease-out;
}

.preset-detail-card {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
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

/* Custom scrollbar for the modal content */
.preset-content {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.preset-content::-webkit-scrollbar {
  width: 6px;
}

.preset-content::-webkit-scrollbar-track {
  background: transparent;
}

.preset-content::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.preset-content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.7);
}
</style>
