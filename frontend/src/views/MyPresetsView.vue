<template>
  <div class="min-h-screen flex-1 pt-24 px-6 lg:px-20">
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold">My Presets</h1>
        <Button label="Create Preset" icon="pi pi-plus" @click="showCreateDialog" />
      </div>

      <!-- Presets Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PresetCard v-for="preset in presets" :key="preset.id" :preset="preset" :show-actions="true" @edit="editPreset"
          @delete="confirmDelete" @apply="applyPreset" @download="downloadPreset" />
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <Dialog v-model:visible="showPresetDialog" :header="editingPreset ? 'Edit Preset' : 'Create Preset'" :modal="true"
      class="w-full max-w-md">
      <form @submit.prevent="savePreset" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-300">Name</label>
          <InputText id="name" v-model="presetForm.name" class="w-full" />
        </div>
        <div>
          <label for="category" class="block text-sm font-medium text-gray-300">Category</label>
          <Select id="category" v-model="presetForm.preset_category_id" :options="presetCategoryStore.categories"
            optionLabel="name" optionValue="id" placeholder="Select a Category" class="w-full" />
        </div>
        <div>
          <label for="settings" class="block text-sm font-medium text-gray-300">Settings (JSON)</label>
          <Textarea id="settings" v-model="presetForm.settings" class="w-full" rows="5" />
        </div>
        <div class="flex items-center">
          <Checkbox id="public" v-model="presetForm.public" :binary="true" />
          <label for="public" class="ml-2 text-sm text-gray-300">Public</label>
        </div>
        <div>
          <label for="color" class="block text-sm font-medium text-gray-300">Chart Color</label>
          <ColorPicker id="color" v-model="presetForm.color" />
        </div>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" @click="cancelEdit" class="p-button-text" />
          <Button type="submit" :label="editingPreset ? 'Update' : 'Create'" />
        </div>
      </form>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:visible="showDeleteDialog" header="Confirm Deletion" :modal="true" class="w-full max-w-sm">
      <div class="text-center">
        <p class="mb-4">Are you sure you want to delete this preset?</p>
        <div class="flex justify-center gap-2">
          <Button label="Cancel" @click="showDeleteDialog = false" class="p-button-text" />
          <Button label="Delete" @click="deleteConfirmed" class="p-button-danger" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import ColorPicker from 'primevue/colorpicker';
import Select from 'primevue/select';
import PresetCard from '@/components/PresetCard.vue';
import { getUserPresets, createPreset, updatePreset, deletePreset } from '@/services/presets';
import { useAuthStore } from '@/stores/authStore';
import { useEqualizerStore } from '@/stores/equalizerStore';
import { usePresetCategoryStore } from '@/stores/presetCategoryStore';

export default {
  name: 'MyPresetsView',
  components: {
    Button,
    Dialog,
    InputText,
    Textarea,
    Checkbox,
    ColorPicker,
    Select,
    PresetCard
  },
  data() {
    const presetCategoryStore = usePresetCategoryStore();
    return {
      presets: [],
      editingPreset: null,
      showPresetDialog: false,
      showDeleteDialog: false,
      presetToDelete: null,
      presetForm: {
        name: '',
        preset_category_id: null,
        settings: '',
        public: false,
        color: '#4ade80',
      },
      presetCategoryStore,
    };
  },
  async created() {
    await this.fetchPresets();
    this.presetCategoryStore.fetchPresetCategories();
  },
  methods: {
    async fetchPresets() {
      try {
        const authStore = useAuthStore();
        const response = await getUserPresets();

        if (!response.data || !Array.isArray(response.data)) {
          this.presets = [];
          return;
        }

        this.presets = response.data.map(p => {
          let settingsArray = [];
          try {
            if (p.settings && typeof p.settings === 'string') {
              const parsed = JSON.parse(p.settings);
              if (Array.isArray(parsed)) {
                settingsArray = parsed;
              }
            }
          } catch (e) {
            console.error(`Failed to parse settings for preset ID ${p.id}:`, p.settings, e);
          }

          const formatFrequency = (freq) => {
            if (freq >= 1000) {
              return `${Math.round(freq / 1000)}kHz`;
            }
            return `${Math.round(freq)}Hz`;
          };

          const transformedPreset = {
            id: p.id,
            name: p.name || 'Unnamed Preset',
            creator: authStore.user?.name || 'You',
            preset_category_id: p.preset_category_id,
            preset_category: p.preset_category || { name: 'General' },
            tags: p.tags || [],
            usageCount: p.usage_count || 0,
            rating: p.rating || 0,
            isStaffPick: p.is_staff_pick || false,
            settings: p.settings,
            public: p.public,
            color: p.color || '#4ade80',
            chartData: {
              labels: settingsArray.map(band => formatFrequency(band.frequency)),
              datasets: [
                {
                  label: 'EQ Curve',
                  data: settingsArray.map(band => band.gain || 0),
                  borderColor: p.color || '#4ade80',
                  tension: 0.4,
                },
              ],
            },
          };
          return transformedPreset;
        });
      } catch (error) {
        console.error('Error fetching presets:', error);
        this.presets = [];
      }
    },
    showCreateDialog() {
      this.editingPreset = null;
      this.resetForm();
      this.showPresetDialog = true;
    },
    editPreset(preset) {
      this.editingPreset = preset;
      try {
        this.presetForm = {
          ...preset,
          settings: JSON.stringify(JSON.parse(preset.settings), null, 2),
          public: !!preset.public,
        };
      } catch (e) {
        this.presetForm = { ...preset, settings: 'Error parsing settings.' }
        console.error(`Could not parse settings for preset ${preset.id} on edit:`, preset.settings, e);
      }
      this.showPresetDialog = true;
    },
    cancelEdit() {
      this.editingPreset = null;
      this.resetForm();
      this.showPresetDialog = false;
    },
    resetForm() {
      this.presetForm = {
        name: '',
        preset_category_id: null,
        settings: '',
        public: false,
        color: '#4ade80',
      };
    },
    async savePreset() {
      try {
        // Ensure the settings are valid JSON before creating the payload
        JSON.parse(this.presetForm.settings);
        const payload = {
          name: this.presetForm.name,
          preset_category_id: this.presetForm.preset_category_id,
          settings: this.presetForm.settings, // Pass settings as a string
          public: this.presetForm.public,
          color: this.presetForm.color,
        };

        if (this.editingPreset) {
          await updatePreset(this.editingPreset.id, payload);
        } else {
          await createPreset(payload);
        }
        await this.fetchPresets();
        this.cancelEdit();
      } catch (error) {
        console.error('Error saving preset:', error);
        // Handle error
      }
    },
    confirmDelete(preset) {
      this.presetToDelete = preset;
      this.showDeleteDialog = true;
    },
    async deleteConfirmed() {
      if (!this.presetToDelete) return;
      try {
        await deletePreset(this.presetToDelete.id);
        await this.fetchPresets();
      } catch (error) {
        console.error('Error deleting preset:', error);
        // Handle error
      } finally {
        this.showDeleteDialog = false;
        this.presetToDelete = null;
      }
    },
    applyPreset(preset) {
      try {
        const equalizerStore = useEqualizerStore();
        const settings = JSON.parse(preset.settings);
        equalizerStore.loadPreset(settings);
        this.$router.push('/equalizer');
      } catch (error) {
        console.error('Failed to apply preset:', error);
      }
    },
    downloadPreset(preset) {
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
  },
};
</script>
