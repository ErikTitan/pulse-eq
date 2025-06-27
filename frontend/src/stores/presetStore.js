import { defineStore } from 'pinia';
import { getPublicPresets } from '@/services/presetService';

export const usePresetStore = defineStore('preset', {
  state: () => ({
    presets: [],
  }),
  actions: {
    async fetchPublicPresets() {
      try {
        const response = await getPublicPresets();
        console.log('Raw presets from API:', response.data);
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
            creator: p.user?.name || 'Anonymous',
            preset_category_id: p.preset_category_id,
            preset_category: p.preset_category || { name: 'General' },
            tags: p.tags || [],
            usageCount: p.uses_count || 0,
            rating: p.ratings_avg_rating || 0,
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
        console.error('Error loading public presets:', error);
      }
    },
    updatePresetRating(presetId, newRating) {
      const preset = this.presets.find(p => p.id === presetId);
      if (preset) {
        preset.rating = newRating;
      }
    },
  },
});
