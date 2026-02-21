<script>
import Select from 'primevue/select'
import { useAudioUploadStore } from '@/stores/audioUploadStore'

export default {
  name: 'AudioFileSelector',
  components: {
    Select,
  },
  data() {
    return {
      audioUploadStore: useAudioUploadStore(),
    }
  },
  computed: {
    // Get audio sources from the store
    audioSources() {
      return this.audioUploadStore.audioSources
    },

    // Two-way binding with the store's selected audio source
    selectedAudioSource: {
      get() {
        return this.audioUploadStore.selectedAudioSource
      },
      set(value) {
        this.audioUploadStore.setSelectedAudioSource(value)
        // Emit event to parent components when selection changes
        this.$emit('audio-source-changed', value)
      },
    },

    // Check if any uploaded files are available
    hasUploadedFiles() {
      return this.audioUploadStore.hasUploadedFiles
    },
  },
  emits: ['audio-source-changed'],
}
</script>

<template>
  <div class="audio-file-selector">
    <Select
      id="audio-source-select"
      v-model="selectedAudioSource"
      :options="audioSources"
      option-label="name"
      option-value="id"
      placeholder="Select audio source"
      class="w-full"
      :class="{
        'ring-2 ring-primary-200': hasUploadedFiles,
      }"
    >
      <template #option="slotProps">
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center space-x-2">
            <i
              :class="slotProps.option.isDefault ? 'pi pi-music' : 'pi pi-file-audio'"
              class="text-sm"
              :style="{
                color: slotProps.option.isDefault ? 'var(--p-primary-500)' : 'var(--p-surface-500)',
              }"
            ></i>
            <span class="font-medium">{{ slotProps.option.name }}</span>
          </div>
          <div v-if="!slotProps.option.isDefault" class="text-xs text-surface-500">
            {{ Math.round(slotProps.option.duration) }}s •
            {{ (slotProps.option.size / 1024 / 1024).toFixed(1) }}MB
          </div>
        </div>
      </template>

      <template #value="slotProps">
        <div v-if="slotProps.value" class="flex items-center space-x-2">
          <i
            :class="
              audioSources.find((s) => s.id === slotProps.value)?.isDefault
                ? 'pi pi-music'
                : 'pi pi-file-audio'
            "
            class="text-sm"
            :style="{
              color: audioSources.find((s) => s.id === slotProps.value)?.isDefault
                ? 'var(--p-primary-500)'
                : 'var(--p-surface-500)',
            }"
          ></i>
          <span>{{ audioSources.find((s) => s.id === slotProps.value)?.name }}</span>
        </div>
      </template>
    </Select>

    <!-- Helper text -->
    <div class="mt-1 text-xs text-surface-500">
      <span v-if="!hasUploadedFiles"> Upload audio files to see more options </span>
      <span v-else>
        {{ audioSources.length - 1 }} uploaded file{{ audioSources.length - 1 !== 1 ? 's' : '' }}
        available
      </span>
    </div>
  </div>
</template>

<style scoped>
.audio-file-selector {
  --audio-selector-border-radius: var(--p-border-radius-md);
  --audio-selector-focus-ring: var(--p-focus-ring);
}

.audio-file-selector :deep(.p-select:focus-within) {
  box-shadow: var(--audio-selector-focus-ring);
}

.audio-file-selector :deep(.p-select.ring-2) {
  transition: box-shadow 0.2s ease-in-out;
}

.audio-file-selector :deep(.p-select-option) {
  padding: 0.75rem;
}

.audio-file-selector :deep(.p-select-option-group) {
  @apply px-3 py-2;
  font-weight: 600;
  color: var(--p-surface-600);
  background: var(--p-surface-50);
}
</style>
