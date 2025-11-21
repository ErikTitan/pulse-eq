<script>
import Button from 'primevue/button';
import Tooltip from 'primevue/tooltip';
import { useAudioUploadStore } from '@/stores/audioUploadStore';

export default {
  name: 'AudioComparison',
  components: {
    Button,
  },
  directives: {
    tooltip: Tooltip
  },
  data() {
    return {
      audioUploadStore: useAudioUploadStore(),
    };
  },
  computed: {
    isOriginal() {
      return this.audioUploadStore.isOriginalAudio;
    },
    hasUploadedFile() {
      return this.audioUploadStore.selectedAudioSource !== 'default';
    },
    buttonLabel() {
      return this.isOriginal ? 'Original' : 'With Preset';
    },
    buttonIcon() {
      return this.isOriginal ? 'pi pi-volume-up' : 'pi pi-sliders-h';
    },
    buttonSeverity() {
      return this.isOriginal ? 'secondary' : 'success';
    },
    currentAudioSourceName() {
      if (this.audioUploadStore.selectedAudioSource === 'default') {
        return 'Default Sample';
      }
      const selectedFile = this.audioUploadStore.selectedFile;
      return selectedFile ? selectedFile.name : 'Unknown';
    },
  },
  methods: {
    toggleComparison() {
      if (this.hasUploadedFile) {
        this.audioUploadStore.toggleOriginalAudio();
        this.$emit('audio-mode-changed', {
          isOriginal: this.audioUploadStore.isOriginalAudio,
          audioSource: this.audioUploadStore.selectedAudioSource,
        });
      }
    },
  },
  emits: ['audio-mode-changed'],
};
</script>

<template>
  <div class="audio-comparison">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Button :label="buttonLabel" :icon="buttonIcon" @click="toggleComparison" :severity="buttonSeverity"
          :disabled="!hasUploadedFile" size="small" outlined class="w-full"
          v-tooltip.top="!hasUploadedFile ? 'Upload a custom audio file to compare original vs processed audio' : 'Toggle between original and processed audio'" />
      </div>

      <div class="flex items-center gap-2" v-if="hasUploadedFile">
        <span class="text-xs font-medium px-2 py-1 rounded bg-surface-100 text-surface-600">
          {{ isOriginal ? 'BYPASS' : 'ACTIVE' }}
        </span>
      </div>
    </div>
  </div>
</template>
