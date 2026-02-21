<script>
import Button from "primevue/button";
import ProgressBar from "primevue/progressbar";
import { useAudioUploadStore } from "@/stores/audioUploadStore";
import { useEqualizerStore } from "@/stores/equalizerStore";

export default {
  name: "AudioUploadManager",
  components: {
    Button,
    ProgressBar,
  },
  data() {
    return {
      audioUploadStore: useAudioUploadStore(),
      equalizerStore: useEqualizerStore(),
      dragActive: false,
    };
  },
  computed: {
    uploadedFiles() {
      return this.audioUploadStore.uploadedFiles;
    },
    isProcessing() {
      return this.audioUploadStore.isProcessing;
    },
    processingProgress() {
      return this.audioUploadStore.processingProgress;
    },
  },
  methods: {
    handleFileSelect(event) {
      const files = event.target.files || event.dataTransfer.files;
      if (files.length === 0) return;

      const file = files[0];

      this.audioUploadStore.processFile(file).catch(error => {
        console.error('Error processing file in component:', error);
      });
    },
    handleDrop(event) {
      event.preventDefault();
      this.dragActive = false;
      this.handleFileSelect(event);
    },
    handleDragEnter() {
      this.dragActive = true;
    },
    handleDragLeave() {
      this.dragActive = false;
    },
    deleteFile(fileId) {
      this.audioUploadStore.removeFile(fileId);
    },
    togglePlayback(file) {
      if (this.audioUploadStore.selectedAudioSource === file.id) {
        // Toggle play/pause if already selected
        if (this.equalizerStore.isPlaying) {
          this.equalizerStore.pauseAudio();
        } else {
          this.equalizerStore.playAudio();
        }
      } else {
        // Select the file (EqualizerView watcher will handle loading)
        this.audioUploadStore.setSelectedAudioSource(file.id);
        // Optionally auto-play after a short delay to allow loading?
        // The watcher in EqualizerView is async, so we can't easily know when it's ready.
        // For now, just selecting it is good feedback. The user can click again to play if it doesn't auto-play.
      }
    },
    getIconClass(file) {
      const isSelected = this.audioUploadStore.selectedAudioSource === file.id;
      const isPlaying = isSelected && this.equalizerStore.isPlaying;

      if (isPlaying) return 'pi pi-pause';
      if (isSelected) return 'pi pi-play';
      return 'pi pi-music'; // Or pi-play, but 'music' indicates it's just a file
    }
  },
};
</script>

<template>
  <div class="audio-upload-manager">
    <div class="border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ease-in-out group" :class="{
      'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20': dragActive,
      'border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-surface-50 dark:hover:bg-surface-800': !dragActive,
    }" @drop="handleDrop" @dragover.prevent @dragenter.prevent="handleDragEnter" @dragleave.prevent="handleDragLeave">

      <div class="pointer-events-none">
        <div
          class="mb-3 text-surface-400 dark:text-surface-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors duration-300">
          <i class="pi pi-cloud-upload text-3xl"></i>
        </div>
        <p class="text-surface-700 dark:text-surface-200 font-medium mb-1">
          Click or drag file here
        </p>
        <p class="text-xs text-surface-500 dark:text-surface-400 mb-4">
          MP3, WAV, FLAC, AAC (Max 50MB)
        </p>
      </div>

      <input type="file" @change="handleFileSelect" accept="audio/*" class="hidden" ref="fileInput" />

      <Button label="Select File" size="small" outlined @click="$refs.fileInput.click()" />
    </div>

    <ProgressBar v-if="isProcessing" :value="processingProgress" class="mt-4 h-2" />

    <div v-if="uploadedFiles.length > 0" class="mt-6">
      <div class="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3 px-1">
        Uploaded Files</div>
      <div class="space-y-2">
        <div v-for="file in uploadedFiles" :key="file.id"
          class="flex items-center justify-between p-3 rounded-lg border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
          <div class="flex items-center space-x-3 overflow-hidden">
            <div
              class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
              @click="togglePlayback(file)">
              <i :class="[getIconClass(file), 'text-primary-600 dark:text-primary-400 text-sm']"></i>
            </div>
            <div class="min-w-0">
              <p class="font-medium text-sm truncate"
                :class="{ 'text-primary-600 dark:text-primary-400': audioUploadStore.selectedAudioSource === file.id }">
                {{ file.name }}
              </p>
              <p class="text-xs text-surface-500 dark:text-surface-400">
                {{ Math.round(file.duration) }}s •
                {{ (file.size / 1024 / 1024).toFixed(1) }}MB
              </p>
            </div>
          </div>
          <Button icon="pi pi-trash" severity="danger" text rounded size="small" @click="deleteFile(file.id)" />
        </div>
      </div>
    </div>
  </div>
</template>
