<template>
  <div v-if="visible" class="preset-preview-modal fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Close Button -->
      <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
        <i class="pi pi-times text-xl"></i>
      </button>

      <!-- Modal Body -->
      <div class="p-6">
        <MiniEqPreview :preset="preset" :show-audio-preview="true" @apply="handleApply" @download="handleDownload" />

        <!-- Additional Info -->
        <div class="mt-6 pt-4 border-t border-gray-700">
          <div class="flex items-center justify-between text-sm text-gray-400">
            <span>{{ preset.usageCount || 0 }} users</span>
            <div class="flex items-center space-x-4">
              <span v-if="preset.rating > 0">
                ⭐ {{ preset.rating.toFixed(1) }}
              </span>
              <span>{{ preset.preset_category?.name || 'General' }}</span>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="preset.tags?.length" class="flex flex-wrap gap-2 mt-3">
            <span v-for="tag in preset.tags" :key="tag.id" class="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
              {{ tag.name }}
            </span>
          </div>

          <!-- Description -->
          <p v-if="preset.description" class="mt-3 text-sm text-gray-300">
            {{ preset.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue';
import MiniEqPreview from './MiniEqPreview.vue';
import { usePresetStore } from '@/stores/presetStore';
import { useRouter } from 'vue-router';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  preset: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'download']);

const presetStore = usePresetStore();
const router = useRouter();

const handleApply = (preset) => {
  // Apply the preset to the equalizer
  try {
    const settings = typeof preset.settings === 'string'
      ? JSON.parse(preset.settings)
      : preset.settings;
    presetStore.applyPreset(settings);

    // Close modal and navigate to equalizer
    emit('close');
    router.push({ name: 'equalizer' });
  } catch (error) {
    console.error('Error applying preset:', error);
  }
};

const handleDownload = (preset) => {
  emit('download', preset);
};

// Handle escape key to close modal
const handleEscape = (event) => {
  if (event.key === 'Escape' && props.visible) {
    emit('close');
  }
};

// Add/remove escape key listener
watch(() => props.visible, (visible) => {
  if (visible) {
    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  } else {
    document.removeEventListener('keydown', handleEscape);
    document.body.style.overflow = '';
  }
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
</style>
