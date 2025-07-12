<template>
  <div v-if="visible || shouldFetchData"
    class="preset-preview-modal fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" @click="handleClose"></div>

    <!-- Modal Content -->
    <div class="relative max-w-lg w-full">
      <Card class="overflow-hidden shadow-2xl">
        <template #content>
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-8">
            <i class="pi pi-spin pi-spinner text-primary-500" style="font-size: 2rem"></i>
            <p class="text-surface-600 dark:text-surface-400 mt-4">Loading preset...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-8">
            <div class="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 class="text-xl font-bold text-surface-800 dark:text-surface-100 mb-2">Preset Not Found</h2>
            <p class="text-surface-600 dark:text-surface-400 mb-4">The preset you're looking for doesn't exist or has
              been removed.</p>
            <Button label="Go Back" icon="pi pi-arrow-left" @click="handleClose" />
          </div>

          <!-- Preset Content -->
          <div v-else-if="currentPreset" class="preset-content">
            <!-- Close Button -->
            <button @click="handleClose"
              class="absolute top-4 right-4 text-surface-500 hover:text-surface-800 dark:hover:text-surface-100 z-10 transition-colors">
              <i class="pi pi-times text-xl"></i>
            </button>

            <!-- Header Section -->
            <div class="mb-6 pr-8">
              <h1 class="text-2xl font-bold text-surface-800 dark:text-surface-100 mb-2">{{ currentPreset.name }}</h1>
              <div
                class="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-surface-600 dark:text-surface-400 mb-4">
                <span>by {{ currentPreset.user?.name || currentPreset.creator || 'Anonymous' }}</span>
                <span class="text-surface-400 dark:text-surface-600">•</span>
                <span>{{ (currentPreset.uses_count || currentPreset.usageCount || 0) }} users</span>
                <span class="text-surface-400 dark:text-surface-600">•</span>
                <Tag :value="currentPreset.preset_category?.name || 'General'" class="text-xs" />
              </div>

              <!-- Rating Section -->
              <div
                class="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
                <div class="flex items-center gap-3">
                  <span class="text-sm text-surface-700 dark:text-surface-300 font-medium">Your Rating:</span>
                  <Rating v-model="userRating" @update:modelValue="handleRating"
                    :readonly="!authStore.isAuthenticated || isRatingInProgress" :cancel="false" />
                </div>
                <div
                  class="text-right text-sm text-surface-700 dark:text-surface-300 font-medium flex items-center gap-2">
                  <i class="pi pi-star-fill text-primary-500"></i>
                </div>
              </div>
            </div>

            <!-- EQ Preview -->
            <div class="mb-6">
              <MiniEqPreview :preset="transformedPreset" :show-audio-preview="true" @apply="handleApply"
                @download="handleDownload" />
            </div>

            <!-- Description -->
            <div v-if="currentPreset.description" class="mb-4">
              <h3 class="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Description</h3>
              <p
                class="text-sm text-surface-600 dark:text-surface-400 leading-relaxed p-3 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
                {{ currentPreset.description }}
              </p>
            </div>

            <!-- Tags -->
            <div v-if="currentPreset.tags?.length" class="mb-4">
              <h3 class="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">Tags</h3>
              <div class="flex flex-wrap gap-2">
                <Tag v-for="tag in currentPreset.tags" :key="tag.id" :value="tag.name" />
              </div>
            </div>

            <!-- Additional Details -->
            <div v-if="currentPreset.created_at" class="text-xs text-surface-500 dark:text-surface-400">
              Created on {{ formatDate(currentPreset.created_at) }}
            </div>

            <!-- SEO Content (Hidden but crawlable) -->
            <div class="hidden">
              <h2>About this EQ Preset</h2>
              <p>
                The "{{ currentPreset.name }}" equalizer preset by {{ currentPreset.user?.name || currentPreset.creator
                  || 'Anonymous' }}
                <span v-if="currentPreset.description">is {{ currentPreset.description.toLowerCase() }}</span>
                <span v-else>provides professional-quality audio enhancement</span>.
                This preset has been used by {{ (currentPreset.uses_count || currentPreset.usageCount || 0) }} users and
                belongs to the
                {{ currentPreset.preset_category?.name || 'General' }} category.
              </p>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MiniEqPreview from './MiniEqPreview.vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Rating from 'primevue/rating';
import Tag from 'primevue/tag';
import { usePresetStore } from '@/stores/presetStore';
import { useAuthStore } from '@/stores/authStore';
import { seoManager } from '@/utils/seoManager';
import { ratePreset } from '@/services/presetService';
import axios from '@/axios';

const props = defineProps({
  visible: { type: Boolean, default: false },
  preset: { type: Object, default: null },
  slug: { type: String, default: null }
});

const emit = defineEmits(['close', 'download']);

const route = useRoute();
const router = useRouter();
const presetStore = usePresetStore();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref(false);
const fetchedPreset = ref(null);
const userRating = ref(0);
const isRatingInProgress = ref(false);

const shouldFetchData = computed(() => props.slug && !props.preset && !props.visible);
const currentPreset = computed(() => props.preset || fetchedPreset.value);

const transformedPreset = computed(() => {
  if (!currentPreset.value) return null;
  return {
    id: currentPreset.value.id,
    name: currentPreset.value.name,
    slug: currentPreset.value.slug,
    description: currentPreset.value.description,
    creator: currentPreset.value.user?.name || currentPreset.value.creator || 'Anonymous',
    settings: currentPreset.value.settings,
    color: currentPreset.value.color || '#4ade80',
    usageCount: currentPreset.value.uses_count || currentPreset.value.usageCount || 0,
    rating: currentPreset.value.ratings_avg_rating || currentPreset.value.rating || 0,
    preset_category: currentPreset.value.preset_category,
    tags: currentPreset.value.tags || []
  };
});

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric'
});

const fetchPresetData = async (slug) => {
  if (!slug) return;
  loading.value = true;
  error.value = false;
  try {
    const response = await axios.get(`/presets/slug/${slug}`);
    fetchedPreset.value = response.data;
    userRating.value = response.data.user_rating || 0;
    if (!props.visible) {
      seoManager.setPresetSEO({
        name: response.data.name,
        description: response.data.description,
        creator: response.data.user?.name || 'Anonymous',
        rating: response.data.ratings_avg_rating || 0,
        usageCount: response.data.uses_count || 0
      });
    }
  } catch (err) {
    console.error('Failed to fetch preset:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const handleRating = async (newRating) => {
  if (!authStore.isAuthenticated || isRatingInProgress.value) return;

  isRatingInProgress.value = true;
  const previousRating = userRating.value;
  userRating.value = newRating; // Optimistic UI update

  try {
    const response = await ratePreset(currentPreset.value.id, newRating);
    const newAverageRating = response.data.new_average_rating;

    if (currentPreset.value) {
      currentPreset.value.ratings_avg_rating = newAverageRating;
    }
    presetStore.updatePresetRating(currentPreset.value.id, newAverageRating);

  } catch (error) {
    console.error('Failed to rate preset:', error);
    userRating.value = previousRating; // Revert on failure
  } finally {
    isRatingInProgress.value = false;
  }
};

const handleApply = () => {
  try {
    const settings = typeof currentPreset.value.settings === 'string'
      ? JSON.parse(currentPreset.value.settings)
      : currentPreset.value.settings;
    presetStore.applyPreset(settings);
    handleClose();
    router.push({ name: 'equalizer' });
  } catch (error) {
    console.error('Error applying preset:', error);
  }
};

const handleDownload = () => {
  try {
    const settings = JSON.stringify(JSON.parse(currentPreset.value.settings), null, 2);
    const blob = new Blob([settings], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPreset.value.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    emit('download', currentPreset.value);
  } catch (error) {
    console.error('Failed to download preset:', error);
  }
};

const handleClose = () => {
  emit('close');
  if (route.name === 'PresetDetail') {
    router.push({ name: authStore.isAuthenticated ? 'presets' : 'home' });
  }
};

const handleEscape = (event) => {
  if (event.key === 'Escape' && (props.visible || shouldFetchData.value)) {
    handleClose();
  }
};

watch(() => props.visible, (visible) => {
  if (visible) {
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
  } else {
    document.removeEventListener('keydown', handleEscape);
    document.body.style.overflow = '';
  }
});

watch(() => props.slug, (newSlug) => {
  if (newSlug && !props.preset) fetchPresetData(newSlug);
}, { immediate: true });

watch(() => props.preset, (newPreset) => {
  if (newPreset) userRating.value = newPreset.user_rating || 0;
}, { immediate: true });

onMounted(() => {
  const routeSlug = route.params.slug;
  if (routeSlug && !props.preset && !props.slug) {
    fetchPresetData(routeSlug);
  }
  if (shouldFetchData.value) {
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
  }
});

onUnmounted(() => {
  if (!props.visible) seoManager.reset();
  document.removeEventListener('keydown', handleEscape);
  document.body.style.overflow = '';
});
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

.preset-preview-modal>div:last-child {
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
</style>
