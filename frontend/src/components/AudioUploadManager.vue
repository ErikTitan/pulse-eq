<script>
import Card from "primevue/card";
import Button from "primevue/button";
import ProgressBar from "primevue/progressbar";
import { useAudioUploadStore } from "@/stores/audioUploadStore";
import AudioFileProcessor from "@/utils/AudioFileProcessor";

export default {
  name: "AudioUploadManager",
  components: {
    Card,
    Button,
    ProgressBar,
  },
  data() {
    return {
      audioUploadStore: useAudioUploadStore(),
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

      // Inline validation
      if (!AudioFileProcessor.isValidFileType(file.type)) {
        this.$toast.add({
          severity: 'error',
          summary: 'Invalid File Type',
          detail: `File type "${file.type}" is not supported.`,
          life: 5000,
        });
        return;
      }

      if (!AudioFileProcessor.isValidFileSize(file.size)) {
        this.$toast.add({
          severity: 'error',
          summary: 'File Too Large',
          detail: `File size exceeds the ${AudioFileProcessor.MAX_FILE_SIZE / 1024 / 1024}MB limit.`,
          life: 5000,
        });
        return;
      }

      this.audioUploadStore.processFile(file);
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
  },
};
</script>

<template>
  <Card class="shadow-lg">
    <template #title>
      <div class="text-xl font-semibold mb-4">Upload Audio File</div>
    </template>
    <template #content>
      <div class="border-2 border-dashed rounded-lg p-8 text-center transition-colors" :class="{
        'border-primary-300 bg-primary-50': dragActive,
        'border-surface-300': !dragActive,
      }" @drop="handleDrop" @dragover.prevent @dragenter.prevent="handleDragEnter"
        @dragleave.prevent="handleDragLeave">
        <i class="pi pi-cloud-upload text-4xl text-surface-400 mb-4"></i>
        <p class="text-surface-600 mb-4">
          Drag and drop your audio file here, or click to browse
        </p>
        <input type="file" @change="handleFileSelect" accept="audio/*" class="hidden" ref="fileInput" />
        <Button label="Choose File" icon="pi pi-upload" @click="$refs.fileInput.click()" class="mb-4" />
        <p class="text-sm text-surface-500">
          Supported formats: MP3, WAV, FLAC, AAC (Max 50MB)
        </p>
      </div>

      <ProgressBar v-if="isProcessing" :value="processingProgress" class="mt-4" />

      <div v-if="uploadedFiles.length > 0" class="mt-6">
        <h4 class="text-lg font-medium mb-3">Uploaded Files</h4>
        <div class="space-y-2">
          <div v-for="file in uploadedFiles" :key="file.id"
            class="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
            <div class="flex items-center space-x-3">
              <i class="pi pi-file-audio text-primary-500"></i>
              <div>
                <p class="font-medium">{{ file.name }}</p>
                <p class="text-sm text-surface-500">
                  {{ Math.round(file.duration) }}s •
                  {{ (file.size / 1024 / 1024).toFixed(1) }}MB
                </p>
              </div>
            </div>
            <Button icon="pi pi-trash" severity="danger" text @click="deleteFile(file.id)" />
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>
