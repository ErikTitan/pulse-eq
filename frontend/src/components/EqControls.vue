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
import { useEqualizerStore } from '@/stores/equalizerStore';
import { usePresetCategoryStore } from '@/stores/presetCategoryStore';
import { WEQ8Runtime } from 'weq8';

import { useAuthStore } from '@/stores/authStore';
import { createPreset } from '@/services/presets';

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
    Select
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
        preset_category_id: null,
        public: false,
      },
    }
  },
  emits: ['update:filters', 'update-filter', 'update-weq8'],
  methods: {
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
        const settings = this.filters.map(filter => ({
          type: filter.type,
          frequency: filter.frequency,
          gain: filter.gain,
          Q: filter.Q,
          bypass: filter.bypass
        }));

        const payload = {
          name: this.savePresetForm.name,
          preset_category_id: this.savePresetForm.preset_category_id,
          public: this.savePresetForm.public,
          settings: JSON.stringify(settings),
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
          preset_category_id: null,
          public: false,
        };
      } catch (error) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save preset',
          life: 3000
        });
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
      this.source.disconnect();
      this.weq8.disconnect();

      const newWeq8 = new WEQ8Runtime(this.audioContext);
      const newFilters = importData.filters.map(filter => ({
        ...filter,
        Q: filter.Q || 1,
        bypass: filter.bypass || false
      }));

      this.$emit('update:filters', newFilters);

      newFilters.forEach((filter, index) => {
        newWeq8.setFilterType(index, filter.type);
        newWeq8.setFilterFrequency(index, filter.frequency);
        if (this.equalizerStore.filterHasGain(filter.type)) {
          newWeq8.setFilterGain(index, filter.gain);
        }
        if (this.equalizerStore.filterHasQ(filter.type)) {
          newWeq8.setFilterQ(index, filter.Q);
        }
        newWeq8.toggleBypass(index, filter.bypass);
      });

      this.source.connect(newWeq8.input);
      newWeq8.connect(this.analyserNode);
      this.$emit('update-weq8', newWeq8);
    },

    cancelImport() {
      this.clearUpload();
      this.showImportDialog = false;
    },

    clearUpload() {
      this.uploadedFile = null;
      this.importedSettings = '';
    }
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
            <InputText id="preset-name" v-model="savePresetForm.name" />
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
