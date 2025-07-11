<template>
  <div class="min-h-screen flex-1 pt-24 px-6 lg:px-20">
    <Toast />
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold">My Presets</h1>
        <div class="flex gap-2">
          <Button label="Profile" icon="pi pi-user" @click="showProfileDialog = true" />
          <Button label="Create Preset" icon="pi pi-plus" @click="showCreateDialog" />
        </div>
      </div>

      <!-- Presets Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PresetCard v-for="preset in presets" :key="preset.id" :preset="preset" :show-actions="true"
          :show-user-avatar="false" @edit="editPreset" @delete="confirmDelete" @apply="applyPreset"
          @download="downloadPreset" />
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <Dialog v-model:visible="showPresetDialog" :header="editingPreset ? 'Edit Preset' : 'Create Preset'" :modal="true"
      class="w-full max-w-md">
      <form @submit.prevent="savePreset" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-300">Name</label>
          <InputText id="name" v-model="presetForm.name" class="w-full" maxlength="50" />
          <small class="text-xs text-gray-400">{{ presetForm.name.length }}/50 characters</small>
        </div>
        <div>
          <label for="category" class="block text-sm font-medium text-gray-300">Category</label>
          <Select id="category" v-model="presetForm.preset_category_id" :options="presetCategoryStore.categories"
            optionLabel="name" optionValue="id" placeholder="Select a Category" class="w-full" />
        </div>
        <div>
          <label for="description" class="block text-sm font-medium text-gray-300">Description</label>
          <Textarea id="description" v-model="presetForm.description" class="w-full" rows="2" maxlength="80" />
          <small class="text-xs text-gray-400">{{ (presetForm.description || '').length }}/80 characters</small>
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
          <label for="tags" class="block text-sm font-medium text-gray-300">Tags (Required)</label>
          <InputText id="tags" v-model="presetForm.tagsInput"
            placeholder="Enter tags separated by commas (e.g. bass, gaming, vocal)" class="w-full" />
          <small class="text-xs text-gray-400">Separate multiple tags with commas</small>
        </div>
        <div>
          <label for="color" class="block text-sm font-medium text-gray-300">Chart Color</label>
          <ColorPicker id="color" v-model="presetForm.color" />
        </div>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" @click="cancelEdit" class="p-button-text" />
          <Button type="submit" :label="editingPreset ? 'Update' : 'Create'" :loading="isSavingPreset" />
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

    <!-- Profile Dialog -->
    <Dialog v-model:visible="showProfileDialog" header="Edit Profile" :modal="true" class="w-full max-w-md">
      <form @submit.prevent="updateProfile" class="space-y-4">
        <div class="flex justify-center">
          <UserAvatar :user="authStore.user" :label="authStore.avatarLabel" :variant="authStore.avatarVariant"
            size="xlarge" />
        </div>
        <div>
          <label for="profileName" class="block text-sm font-medium text-gray-300">Name</label>
          <InputText id="profileName" v-model="profileForm.name" class="w-full" />
        </div>
        <div class="flex justify-end gap-2">
          <Button label="Randomize Avatar" @click="randomizeAvatar" class="p-button-secondary" />
          <Button label="Cancel" @click="showProfileDialog = false" class="p-button-text" />
          <Button type="submit" label="Update" :loading="isUpdatingProfile" />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script>
import Toast from 'primevue/toast';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Checkbox from 'primevue/checkbox';
import ColorPicker from 'primevue/colorpicker';
import Select from 'primevue/select';
import PresetCard from '@/components/PresetCard.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { getUserPresets, createPreset, updatePreset, deletePreset } from '@/services/presetService';
import { updateProfile } from '@/services/userService';
import { useAuthStore } from '@/stores/authStore';
import { useEqualizerStore } from '@/stores/equalizerStore';
import { usePresetCategoryStore } from '@/stores/presetCategoryStore';

export default {
  name: 'MyPresetsView',
  components: {
    Toast,
    Button,
    Dialog,
    InputText,
    Textarea,
    Checkbox,
    ColorPicker,
    Select,
    PresetCard,
    UserAvatar,
  },
  data() {
    const presetCategoryStore = usePresetCategoryStore();
    const authStore = useAuthStore();
    return {
      presets: [],
      editingPreset: null,
      showPresetDialog: false,
      showDeleteDialog: false,
      showProfileDialog: false,
      presetToDelete: null,
      isSavingPreset: false,
      presetForm: {
        name: '',
        description: '',
        preset_category_id: null,
        settings: '',
        public: false,
        color: '#4ade80',
        tagsInput: '',
      },
      profileForm: {
        name: authStore.user?.name || '',
      },
      isUpdatingProfile: false,
      presetCategoryStore,
      authStore,
    };
  },
  async created() {
    await this.fetchPresets();
    this.presetCategoryStore.fetchPresetCategories();
  },
  methods: {
    randomizeAvatar() {
      this.authStore.randomizeAvatar();
    },
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
            slug: p.slug,
            creator: authStore.user?.name || 'You',
            user: p.user || authStore.user || null,
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
        // Convert tags array back to comma-separated string for editing
        const tagsInput = preset.tags && preset.tags.length > 0
          ? preset.tags.map(tag => tag.name || tag).join(', ')
          : '';

        this.presetForm = {
          ...preset,
          settings: JSON.stringify(JSON.parse(preset.settings), null, 2),
          public: !!preset.public,
          tagsInput: tagsInput,
        };
      } catch (e) {
        this.presetForm = {
          ...preset,
          settings: 'Error parsing settings.',
          tagsInput: preset.tags && preset.tags.length > 0
            ? preset.tags.map(tag => tag.name || tag).join(', ')
            : ''
        }
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
        description: '',
        preset_category_id: null,
        settings: '',
        public: false,
        color: '#4ade80',
        tagsInput: '',
      };
    },
    async savePreset() {
      if (this.isSavingPreset) return;

      // Validate tags input
      if (!this.presetForm.tagsInput.trim()) {
        this.$toast.add({ severity: 'error', summary: 'Error', detail: 'Tags are required', life: 3000 });
        return;
      }

      this.isSavingPreset = true;
      try {
        // Ensure the settings are valid JSON before creating the payload
        JSON.parse(this.presetForm.settings);

        // Process tags from comma-separated input
        const tags = this.presetForm.tagsInput
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);

        if (tags.length === 0) {
          this.$toast.add({ severity: 'error', summary: 'Error', detail: 'At least one tag is required', life: 3000 });
          return;
        }

        const payload = {
          name: this.presetForm.name,
          description: this.presetForm.description,
          preset_category_id: this.presetForm.preset_category_id,
          settings: this.presetForm.settings, // Pass settings as a string
          public: this.presetForm.public,
          color: this.presetForm.color,
          tags: tags,
        };

        if (this.editingPreset) {
          await updatePreset(this.editingPreset.slug, payload);
        } else {
          await createPreset(payload);
        }
        await this.fetchPresets();
        this.cancelEdit();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'An error occurred';
        this.$toast.add({ severity: 'error', summary: 'Error', detail: errorMessage, life: 3000 });
      } finally {
        this.isSavingPreset = false;
      }
    },
    confirmDelete(preset) {
      this.presetToDelete = preset;
      this.showDeleteDialog = true;
    },
    async deleteConfirmed() {
      if (!this.presetToDelete) return;
      try {
        await deletePreset(this.presetToDelete.slug);
        await this.fetchPresets();
      } catch (error) {
        console.error('Error deleting preset:', error);
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
    async updateProfile() {
      if (this.isUpdatingProfile) return;
      this.isUpdatingProfile = true;
      try {
        const payload = {
          name: this.profileForm.name,
          avatar_variant: this.authStore.avatarVariant,
        };
        await updateProfile(payload);
        await this.authStore.fetchUser(); // Refetch user data
        this.showProfileDialog = false;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'An error occurred';
        this.$toast.add({ severity: 'error', summary: 'Error', detail: errorMessage, life: 3000 });
      } finally {
        this.isUpdatingProfile = false;
      }
    },
  },
};
</script>
