<script>
import Card from 'primevue/card';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import FileUpload from 'primevue/fileupload';
import InputText from 'primevue/inputtext';
import Checkbox from 'primevue/checkbox';
import Select from 'primevue/select';
import AutoComplete from 'primevue/autocomplete';
import { useEqualizerStore } from '@/stores/equalizerStore';
import { usePresetCategoryStore } from '@/stores/presetCategoryStore';
import { WEQ8Runtime } from 'weq8';

import { useAuthStore } from '@/stores/authStore';
import { createPreset } from '@/services/presetService';
import AudioFileSelector from '@/components/AudioFileSelector.vue';
import AudioComparison from '@/components/AudioComparison.vue';

export default {
  name: 'EqControls',
  components: {
    Card,
    Button,
    Toast,
    Dialog,
    Textarea,
    FileUpload,
    InputText,
    Checkbox,
    Select,
    AutoComplete,
    AudioFileSelector,
    AudioComparison
  },
  props: {
    weq8: {
      type: Object,
      required: false
    },
    filters: {
      type: Array,
      required: false
    },
    audioContext: {
      type: Object,
      required: false
    },
    source: {
      type: Object,
      required: false
    },
    analyserNode: {
      type: Object,
      required: false
    }
  },
  data() {
    const equalizerStore = useEqualizerStore();
    const authStore = useAuthStore();
    const presetCategoryStore = usePresetCategoryStore();

    return {
      equalizerStore,
      authStore,
      presetCategoryStore,
      preset: {
        name: 'Equalizer',
        description: '',
      },
      uploadedFile: null,
      showExportDialog: false,
      showImportDialog: false,
      showSaveDialog: false,
      exportedSettings: '',
      importedSettings: '',
      savePresetForm: {
        name: '',
        description: '',
        preset_category_id: null,
        public: false,
        tags: [],
      },
      filteredTags: [],
    }
  },
  emits: ['update:filters', 'update-filter', 'update-weq8'],
  methods: {
    searchTags(event) {
      setTimeout(() => {
        if (!event.query.trim().length) {
          this.filteredTags = [...this.savePresetForm.tags];
        } else {
          this.filteredTags = [event.query.trim()];
        }
      }, 250);
    },
    resetEQ() {
      const defaultFilters = this.equalizerStore.getDefaultFilters();
      const spacedFilters = this.equalizerStore.createSpacedFilters(defaultFilters, this.audioContext);

      this.$emit('update:filters', spacedFilters);

      spacedFilters.forEach((filter, index) => {
        this.weq8.setFilterType(index, filter.type);
        this.weq8.setFilterFrequency(index, filter.frequency);
        this.weq8.setFilterGain(index, 0);
        this.weq8.toggleBypass(index, false);
        this.weq8.setFilterQ(index, 1);
      });

      this.$toast.add({
        severity: 'secondary',
        summary: 'Reset',
        detail: 'EQ settings have been reset to default',
        life: 3000
      });
    },

    async handleSave() {
      if (this.authStore.isAuthenticated) {
        if (this.presetCategoryStore.categories.length === 0) {
          await this.presetCategoryStore.fetchPresetCategories();
        }
        this.showSaveDialog = true;
      } else {
        this.exportSettings();
      }
    },

    async savePreset() {
      try {
        // Validate that tags are provided
        if (!this.savePresetForm.tags || this.savePresetForm.tags.length === 0) {
          this.$toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'At least one tag is required',
            life: 3000
          });
          return;
        }

        // Validate tag limits
        if (this.savePresetForm.tags.length > 10) {
          this.$toast.add({
            severity: 'error',
            summary: 'Too Many Tags',
            detail: 'Maximum 10 tags allowed',
            life: 3000
          });
          return;
        }

        // Validate individual tag length
        for (const tag of this.savePresetForm.tags) {
          if (tag.length > 20) {
            this.$toast.add({
              severity: 'error',
              summary: 'Tag Too Long',
              detail: `Tag "${tag}" exceeds 20 character limit`,
              life: 3000
            });
            return;
          }
        }

        // Validate total character count
        const totalChars = this.savePresetForm.tags.reduce((sum, tag) => sum + tag.length, 0);
        if (totalChars > 100) {
          this.$toast.add({
            severity: 'error',
            summary: 'Tags Too Long',
            detail: 'Combined length of all tags cannot exceed 100 characters',
            life: 3000
          });
          return;
        }

        // Basic profanity check (you can enhance this with a proper profanity filter)
        const profanityWords = ['fuck', 'shit', 'damn', 'bitch', 'ass', 'hell']; // Add more as needed
        for (const tag of this.savePresetForm.tags) {
          const tagLower = tag.toLowerCase();
          if (profanityWords.some(word => tagLower.includes(word))) {
            this.$toast.add({
              severity: 'error',
              summary: 'Inappropriate Content',
              detail: `Tag "${tag}" contains inappropriate content`,
              life: 3000
            });
            return;
          }
        }

        const settings = this.filters.map(filter => ({
          type: filter.type,
          frequency: filter.frequency,
          gain: filter.gain,
          Q: filter.Q,
          bypass: filter.bypass
        }));

        const payload = {
          name: this.savePresetForm.name,
          description: this.savePresetForm.description,
          preset_category_id: this.savePresetForm.preset_category_id,
          public: this.savePresetForm.public,
          settings: JSON.stringify(settings),
          tags: this.savePresetForm.tags,
        };

        await createPreset(payload);

        this.$toast.add({
          severity: 'success',
          summary: 'Saved!',
          detail: 'Preset saved successfully',
          life: 3000
        });

        this.showSaveDialog = false;
        this.savePresetForm = {
          name: '',
          description: '',
          preset_category_id: null,
          public: false,
          tags: [],
        };
      } catch (error) {
        // Handle validation errors from backend
        if (error.response?.status === 422 && error.response?.data?.errors) {
          const errors = error.response.data.errors;

          // Show specific validation errors
          Object.keys(errors).forEach(field => {
            errors[field].forEach(message => {
              this.$toast.add({
                severity: 'error',
                summary: 'Validation Error',
                detail: message,
                life: 5000
              });
            });
          });
        } else {
          // Generic error for other types of failures
          this.$toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to save preset',
            life: 3000
          });
        }
      }
    },

    exportSettings() {
      const exportData = {
        name: this.preset.name,
        description: this.preset.description,
        filters: this.filters.map(filter => ({
          type: filter.type,
          frequency: filter.frequency,
          gain: filter.gain,
          Q: filter.Q,
          bypass: filter.bypass
        })),
        metadata: {
          createdAt: new Date().toISOString(),
          version: "1.0.0",
          application: "PULSE-EQ"
        }
      };

      this.exportedSettings = JSON.stringify(exportData, null, 2);
      this.showExportDialog = true;
    },

    async copyToClipboard() {
      try {
        await navigator.clipboard.writeText(this.exportedSettings);
        this.$toast.add({
          severity: 'success',
          summary: 'Copied!',
          detail: 'Settings copied to clipboard',
          life: 3000
        });
      } catch (err) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to copy settings',
          life: 3000
        });
      }
    },

    downloadPreset() {
      try {
        const exportData = JSON.parse(this.exportedSettings);
        const fileName = `${this.preset.name.toLowerCase().replace(/\s+/g, '-')}-preset.json`;

        const blob = new Blob([this.exportedSettings], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.$toast.add({
          severity: 'success',
          summary: 'Downloaded!',
          detail: 'Preset file downloaded successfully',
          life: 3000
        });
        this.showExportDialog = false;
      } catch (err) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to download preset file',
          life: 3000
        });
      }
    },

    onFileSelect(event) {
      const file = event.files[0];

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          this.importedSettings = JSON.stringify(importData, null, 2);
          this.uploadedFile = file;
        } catch (err) {
          this.$toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Invalid preset file format',
            life: 3000
          });
        }
      };
      reader.readAsText(file);
    },

    confirmImport() {
      try {
        const importData = JSON.parse(this.importedSettings);

        if (!importData.filters || !Array.isArray(importData.filters)) {
          throw new Error('Invalid filter settings format');
        }

        importData.filters.forEach(filter => {
          if (!filter.type || !filter.frequency || typeof filter.gain !== 'number') {
            throw new Error('Invalid filter configuration');
          }
        });

        this.applyImportedSettings(importData);

        this.$toast.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Filter settings imported successfully',
          life: 3000
        });

        this.showImportDialog = false;
        this.importedSettings = '';
      } catch (err) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Invalid filter settings format',
          life: 3000
        });
      }
    },

    applyImportedSettings(importData) {
      const newFilters = importData.filters.map(filter => ({
        ...filter,
        Q: filter.Q || 1,
        bypass: filter.bypass || false,
      }));

      this.$emit('update:filters', newFilters);

      newFilters.forEach((filter, index) => {
        this.weq8.setFilterType(index, filter.type);
        this.weq8.setFilterFrequency(index, filter.frequency);
        if (this.equalizerStore.filterHasGain(filter.type)) {
          this.weq8.setFilterGain(index, filter.gain);
        }
        if (this.equalizerStore.filterHasQ(filter.type)) {
          this.weq8.setFilterQ(index, filter.Q);
        }
        this.weq8.toggleBypass(index, filter.bypass);
      });
    },

    cancelImport() {
      this.clearUpload();
      this.showImportDialog = false;
    },

    clearUpload() {
      this.uploadedFile = null;
      this.importedSettings = '';
    },

  }
}
</script>

<template>
  <Card class="h-full shadow-xl">
    <template #title>
      <div class="text-xl font-semibold mb-2">Controls</div>
    </template>
    <template #content>
      <Toast />

      <!-- Audio File Selector -->
      <div class="mb-4">
        <AudioFileSelector />
      </div>

      <!-- Audio Comparison -->
      <div class="my-4">
        <AudioComparison />
      </div>

      <div class="flex flex-col gap-2">
        <Button label="Save" severity="primary" rounded @click="handleSave" />
        <Button label="Import" outlined rounded @click="showImportDialog = true" />
        <Button label="Reset" severity="secondary" outlined rounded @click="resetEQ" />
      </div>

      <!-- Save Preset Dialog -->
      <Dialog v-model:visible="showSaveDialog" header="Save Preset" modal style="width: 50vw">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="preset-name">Name</label>
            <InputText id="preset-name" v-model="savePresetForm.name" maxlength="50" />
            <small :class="{ 'text-red-500': savePresetForm.name.length >= 50 }">{{ savePresetForm.name.length }}/50
              characters</small>
          </div>
          <div class="flex flex-col gap-2">
            <label for="preset-description">Description</label>
            <Textarea id="preset-description" v-model="savePresetForm.description" rows="3" maxlength="80" />
            <small :class="{ 'text-red-500': savePresetForm.description.length >= 80 }">{{
              savePresetForm.description.length }}/100</small>
          </div>
          <div class="flex flex-col gap-2">
            <label for="preset-tags">Tags</label>
            <AutoComplete id="preset-tags" v-model="savePresetForm.tags" :suggestions="filteredTags"
              @complete="searchTags" multiple separator="," />
          </div>
          <div class="flex flex-col gap-2">
            <label for="preset-category">Category</label>
            <Select id="preset-category" v-model="savePresetForm.preset_category_id"
              :options="presetCategoryStore.categories" optionLabel="name" optionValue="id"
              placeholder="Select a Category" />
          </div>
          <div class="flex items-center gap-2">
            <Checkbox id="preset-public" v-model="savePresetForm.public" :binary="true" />
            <label for="preset-public">Public</label>
          </div>
          <div class="flex justify-end gap-2">
            <Button label="Cancel" severity="secondary" @click="showSaveDialog = false" />
            <Button label="Save" severity="primary" @click="savePreset" />
          </div>
        </div>
      </Dialog>

      <!-- Export Dialog -->
      <Dialog v-model:visible="showExportDialog" header="Export Filter Settings" modal style="width: 50vw">
        <div class="flex flex-col gap-4">
          <div class="text-sm">Your filter settings:</div>
          <Textarea v-model="exportedSettings" size="small" autoResize readonly />
          <div class="flex justify-between gap-4">
            <Button label="Copy to Clipboard" severity="secondary" @click="copyToClipboard" />
            <Button label="Download File" severity="primary" @click="downloadPreset" />
          </div>
        </div>
      </Dialog>

      <!-- Import Dialog -->
      <Dialog v-model:visible="showImportDialog" header="Import Preset" modal style="width: 60vw" @hide="cancelImport">
        <div class="flex flex-col gap-6">
          <div class="text-sm text-gray-600 mb-2">
            Import a PULSE-EQ preset file or paste settings directly:
          </div>

          <FileUpload mode="basic" name="preset" accept=".json" :maxFileSize="1000000" :auto="true"
            chooseLabel="Choose Preset File" class="mb-4" @select="onFileSelect" :customUpload="true">
          </FileUpload>

          <div class="flex flex-col gap-2">
            <label class="text-sm text-gray-600">Or Paste Settings:</label>
            <Textarea v-model="importedSettings" size="small" autoResize
              placeholder="Paste PULSE-EQ preset JSON here..." />
          </div>

          <div class="flex justify-end gap-3 mt-4">
            <Button label="Cancel" severity="secondary" text @click="cancelImport" />
            <Button label="Import Preset" severity="primary" :disabled="!importedSettings" @click="confirmImport" />
          </div>
        </div>
      </Dialog>
    </template>
  </Card>
</template>
